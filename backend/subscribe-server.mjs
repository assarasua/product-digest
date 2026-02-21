import http from "node:http";
import { URL } from "node:url";

const port = Number(process.env.PORT || 8788);
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const pg = await import("pg");
const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 15000),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 10000),
  query_timeout: Number(process.env.DB_QUERY_TIMEOUT_MS || 6000)
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS subscribers (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS post_likes (
    slug TEXT PRIMARY KEY,
    likes_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS product_leaders (
    id BIGSERIAL PRIMARY KEY,
    rank INTEGER NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    profile_url TEXT NOT NULL,
    source_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await pool.query(`ALTER TABLE product_leaders DROP CONSTRAINT IF EXISTS product_leaders_profile_url_key`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    markdown_path TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content_md TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    timezone TEXT NOT NULL DEFAULT 'Europe/Madrid',
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published')),
    scheduled_at TIMESTAMPTZ NULL,
    published_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);
await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_lower_uidx ON posts (lower(slug))`);
await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS markdown_path TEXT NOT NULL DEFAULT ''`);
await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Europe/Madrid'`);
await pool.query(`
  CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    venue TEXT NOT NULL,
    ticketing_url TEXT NOT NULL,
    event_url TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Europe/Madrid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);
await pool.query(`CREATE INDEX IF NOT EXISTS events_date_time_idx ON events (event_date, event_time)`);
await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS date_confirmed BOOLEAN NOT NULL DEFAULT TRUE`);
await pool.query(`
  CREATE TABLE IF NOT EXISTS books (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    book_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);
await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS books_title_lower_uidx ON books (lower(title))`);
await pool.query(`CREATE INDEX IF NOT EXISTS books_created_at_idx ON books (created_at DESC)`);

const booksCacheTtlMs = Math.max(1000, Number(process.env.BOOKS_CACHE_TTL_MS || 60000));
const booksEdgeCacheSeconds = Math.max(0, Number(process.env.BOOKS_EDGE_CACHE_SECONDS || 120));
const booksEdgeStaleSeconds = Math.max(0, Number(process.env.BOOKS_EDGE_STALE_SECONDS || 600));
const booksCache = new Map();

function buildBooksCacheKey(limit, offset) {
  return `${limit}:${offset}`;
}

function getCachedBooks(key) {
  const item = booksCache.get(key);
  if (!item) return null;
  if (Date.now() - item.cachedAt > booksCacheTtlMs) {
    booksCache.delete(key);
    return null;
  }
  return item.data;
}

function setCachedBooks(key, data) {
  booksCache.set(key, { cachedAt: Date.now(), data });
}

function clearBooksCache() {
  booksCache.clear();
}

function send(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, PATCH, DELETE, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    ...extraHeaders
  });
  res.end(JSON.stringify(payload));
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidSlug(value) {
  return /^[a-z0-9-]{3,200}$/.test(value);
}

function isValidTimezone(value) {
  return /^[A-Za-z_]+\/[A-Za-z_]+(?:\/[A-Za-z_]+)?$/.test(value);
}

function isValidDate(value) {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
}

function isValidHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parsePathParams(pathname) {
  const clean = pathname.replace(/\/+$/, "");
  const parts = clean.split("/").filter(Boolean);
  return parts;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function isAuthorizedCronRequest(req) {
  const expected = String(process.env.CRON_SECRET || "").trim();
  if (!expected) {
    return false;
  }
  const authHeader = String(req.headers.authorization || "").trim();
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return false;
  }
  const token = authHeader.slice(7).trim();
  return token === expected;
}

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, PATCH, DELETE, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });
    res.end();
    return;
  }

  if (req.method === "GET" && parsed.pathname === "/") {
    send(res, 200, {
      ok: true,
      service: "product-digest-backend",
      endpoints: [
        "GET /healthz",
        "POST /api/subscribers",
        "GET /api/posts",
        "GET /api/posts/:slug",
        "POST /api/posts",
        "POST /api/posts/publish-due",
        "PATCH /api/posts/:slug/schedule",
        "POST /api/posts/:slug/publish",
        "GET /api/events",
        "POST /api/events",
        "PATCH /api/events/:id",
        "DELETE /api/events/:id",
        "GET /api/books",
        "POST /api/books",
        "PATCH /api/books/:id",
        "DELETE /api/books/:id",
        "GET /api/scheduled-posts",
        "POST /api/scheduled-posts"
      ]
    });
    return;
  }

  if (
    req.method === "GET" &&
    (parsed.pathname === "/healthz" || parsed.pathname === "/health" || parsed.pathname === "/api/healthz")
  ) {
    send(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && parsed.pathname === "/api/likes") {
    const slug = String(parsed.searchParams.get("slug") || "").trim().toLowerCase();

    if (!slug || !isValidSlug(slug)) {
      send(res, 400, { error: "invalid_slug" });
      return;
    }

    try {
      const result = await pool.query("SELECT likes_count FROM post_likes WHERE slug = $1", [slug]);
      const likes = result.rows[0]?.likes_count ?? 0;
      send(res, 200, { slug, likes });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "GET" && parsed.pathname === "/api/product-leaders") {
    try {
      const result = await pool.query(
        `SELECT rank, first_name, last_name, image_url, description, profile_url, source_url
         FROM product_leaders
         ORDER BY rank ASC`
      );
      send(res, 200, { leaders: result.rows });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "GET" && parsed.pathname === "/api/events") {
    try {
      const publicOnly = String(parsed.searchParams.get("public") || "true").toLowerCase() !== "false";
      const limit = Math.min(100, Math.max(1, Number(parsed.searchParams.get("limit") || 20)));
      const offset = Math.max(0, Number(parsed.searchParams.get("offset") || 0));

      const values = [limit, offset];
      let sql = `SELECT id, title, description, date_confirmed, event_date, event_time, venue, ticketing_url, event_url, timezone, created_at, updated_at
                 FROM events`;

      if (publicOnly) {
        sql += ` WHERE date_confirmed = FALSE
                 OR NOW() <= (((event_date::timestamp + event_time) AT TIME ZONE timezone) + INTERVAL '3 days')`;
      }

      sql += ` ORDER BY ((event_date::timestamp + event_time) AT TIME ZONE timezone) ASC
               LIMIT $1 OFFSET $2`;

      const result = await pool.query(sql, values);
      send(res, 200, { events: result.rows });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "POST" && parsed.pathname === "/api/events") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");

      const title = String(payload.title || "").trim();
      const description = String(payload.description || "").trim();
      const dateConfirmedRaw = payload.dateConfirmed ?? payload.date_confirmed;
      const dateConfirmed = dateConfirmedRaw === undefined ? true : Boolean(dateConfirmedRaw);
      const date = String(payload.date || "").trim();
      const time = String(payload.time || "").trim();
      const venue = String(payload.venue || "").trim();
      const ticketingUrl = String(payload.ticketingUrl || payload.ticketing_url || "").trim();
      const url = String(payload.url || payload.event_url || "").trim();
      const timezone = String(payload.timezone || "Europe/Madrid").trim();

      if (!title || !description || !venue) {
        send(res, 400, { error: "missing_fields" });
        return;
      }
      if (!isValidDate(date)) {
        send(res, 400, { error: "invalid_date" });
        return;
      }
      if (!isValidTime(time)) {
        send(res, 400, { error: "invalid_time" });
        return;
      }
      if (!isValidHttpUrl(ticketingUrl)) {
        send(res, 400, { error: "invalid_ticketing_url" });
        return;
      }
      if (!isValidHttpUrl(url)) {
        send(res, 400, { error: "invalid_url" });
        return;
      }
      if (!isValidTimezone(timezone)) {
        send(res, 400, { error: "invalid_timezone" });
        return;
      }

      const result = await pool.query(
        `INSERT INTO events (title, description, date_confirmed, event_date, event_time, venue, ticketing_url, event_url, timezone, updated_at)
         VALUES ($1, $2, $3, $4::date, $5::time, $6, $7, $8, $9, NOW())
         RETURNING id, title, description, date_confirmed, event_date, event_time, venue, ticketing_url, event_url, timezone, created_at, updated_at`,
        [title, description, dateConfirmed, date, time, venue, ticketingUrl, url, timezone]
      );

      send(res, 201, { ok: true, event: result.rows[0] });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "GET" && parsed.pathname === "/api/books") {
    try {
      const limit = Math.min(100, Math.max(1, Number(parsed.searchParams.get("limit") || 50)));
      const offset = Math.max(0, Number(parsed.searchParams.get("offset") || 0));
      const cacheKey = buildBooksCacheKey(limit, offset);
      const cached = getCachedBooks(cacheKey);

      if (cached) {
        send(
          res,
          200,
          { books: cached },
          {
            "Cache-Control": `public, max-age=0, s-maxage=${booksEdgeCacheSeconds}, stale-while-revalidate=${booksEdgeStaleSeconds}`,
            "CDN-Cache-Control": `public, s-maxage=${booksEdgeCacheSeconds}, stale-while-revalidate=${booksEdgeStaleSeconds}`
          }
        );
        return;
      }

      const result = await pool.query(
        `SELECT id, title, description, book_url, created_at, updated_at
         FROM books
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      setCachedBooks(cacheKey, result.rows);
      send(
        res,
        200,
        { books: result.rows },
        {
          "Cache-Control": `public, max-age=0, s-maxage=${booksEdgeCacheSeconds}, stale-while-revalidate=${booksEdgeStaleSeconds}`,
          "CDN-Cache-Control": `public, s-maxage=${booksEdgeCacheSeconds}, stale-while-revalidate=${booksEdgeStaleSeconds}`
        }
      );
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "POST" && parsed.pathname === "/api/books") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");

      const title = String(payload.title || "").trim();
      const description = String(payload.description || "").trim();
      const url = String(payload.url || payload.book_url || "").trim();

      if (!title || !description || !url) {
        send(res, 400, { error: "missing_fields" });
        return;
      }
      if (!isValidHttpUrl(url)) {
        send(res, 400, { error: "invalid_url" });
        return;
      }

      const result = await pool.query(
        `INSERT INTO books (title, description, book_url, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (lower(title))
         DO UPDATE SET
           description = EXCLUDED.description,
           book_url = EXCLUDED.book_url,
           updated_at = NOW()
         RETURNING id, title, description, book_url, created_at, updated_at`,
        [title, description, url]
      );

      clearBooksCache();
      send(res, 201, { ok: true, book: result.rows[0] });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "GET" && parsed.pathname === "/api/posts") {
    try {
      const status = String(parsed.searchParams.get("status") || "published").trim().toLowerCase();
      const tag = String(parsed.searchParams.get("tag") || "").trim().toLowerCase();
      const q = String(parsed.searchParams.get("q") || "").trim().toLowerCase();
      const limit = Math.min(100, Math.max(1, Number(parsed.searchParams.get("limit") || 20)));
      const offset = Math.max(0, Number(parsed.searchParams.get("offset") || 0));
      const allowedStatus = new Set(["scheduled", "published", "all"]);

      if (!allowedStatus.has(status)) {
        send(res, 400, { error: "invalid_status" });
        return;
      }

      const where = [];
      const values = [];
      let index = 1;

      if (status !== "all") {
        where.push(`status = $${index++}`);
        values.push(status);
      }
      if (tag) {
        where.push(`$${index++} = ANY(tags)`);
        values.push(tag);
      }
      if (q) {
        where.push(`(LOWER(title) LIKE $${index} OR LOWER(summary) LIKE $${index} OR LOWER(content_md) LIKE $${index})`);
        values.push(`%${q}%`);
        index += 1;
      }

      values.push(limit);
      values.push(offset);

      const sql = `SELECT slug, markdown_path, title, summary, content_md, tags, timezone, status, scheduled_at, published_at, created_at, updated_at
                   FROM posts
                   ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
                   ORDER BY COALESCE(published_at, scheduled_at, created_at) DESC
                   LIMIT $${index++} OFFSET $${index}`;

      const result = await pool.query(sql, values);
      send(res, 200, { posts: result.rows });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "POST" && parsed.pathname === "/api/posts") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");

      const slug = String(payload.slug || "").trim().toLowerCase();
      const title = String(payload.title || "").trim();
      const summary = String(payload.summary || "").trim();
      const contentMd = String(payload.contentMd || payload.content_md || "").trim();
      const tags = Array.isArray(payload.tags)
        ? payload.tags.map((item) => String(item).trim().toLowerCase()).filter(Boolean)
        : [];
      const status = String(payload.status || "scheduled").trim().toLowerCase();
      const scheduledAt = payload.scheduledAt ? String(payload.scheduledAt).trim() : null;

      if (!slug || !isValidSlug(slug)) {
        send(res, 400, { error: "invalid_slug" });
        return;
      }
      if (!title || !summary || !contentMd) {
        send(res, 400, { error: "missing_fields" });
        return;
      }
      if (!["scheduled", "published"].includes(status)) {
        send(res, 400, { error: "invalid_status" });
        return;
      }
      if (scheduledAt && Number.isNaN(Date.parse(scheduledAt))) {
        send(res, 400, { error: "invalid_scheduled_at" });
        return;
      }

      const markdownPath = String(payload.markdownPath || `db://${slug}`).trim();
      const timezone = String(payload.timezone || "Europe/Madrid").trim();
      const result = await pool.query(
        `INSERT INTO posts (slug, markdown_path, title, summary, content_md, tags, timezone, status, scheduled_at, published_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6::text[], $7, $8, $9::timestamptz, CASE WHEN $8 = 'published' THEN NOW() ELSE NULL END, NOW())
         ON CONFLICT (slug)
         DO UPDATE SET
           markdown_path = EXCLUDED.markdown_path,
           title = EXCLUDED.title,
           summary = EXCLUDED.summary,
           content_md = EXCLUDED.content_md,
           tags = EXCLUDED.tags,
           timezone = EXCLUDED.timezone,
           status = EXCLUDED.status,
           scheduled_at = EXCLUDED.scheduled_at,
           published_at = CASE
             WHEN EXCLUDED.status = 'published' THEN COALESCE(posts.published_at, NOW())
             ELSE posts.published_at
           END,
           updated_at = NOW()
         RETURNING slug, status, scheduled_at, published_at`,
        [slug, markdownPath, title, summary, contentMd, tags, timezone, status, scheduledAt]
      );

      send(res, 200, { ok: true, post: result.rows[0] });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "POST" && parsed.pathname === "/api/posts/publish-due") {
    if (!isAuthorizedCronRequest(req)) {
      send(res, 401, { error: "unauthorized" });
      return;
    }

    try {
      const result = await pool.query(
        `UPDATE posts
         SET status = 'published',
             published_at = COALESCE(published_at, NOW()),
             updated_at = NOW()
         WHERE status = 'scheduled'
           AND scheduled_at IS NOT NULL
           AND scheduled_at <= NOW()
         RETURNING slug, scheduled_at, published_at`
      );

      send(res, 200, {
        ok: true,
        publishedCount: result.rowCount ?? 0,
        posts: result.rows
      });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  const pathParts = parsePathParams(parsed.pathname);
  const isBookDetail = pathParts.length === 3 && pathParts[0] === "api" && pathParts[1] === "books";
  const bookIdFromPath = isBookDetail ? Number(pathParts[2]) : NaN;
  const isEventDetail = pathParts.length === 3 && pathParts[0] === "api" && pathParts[1] === "events";
  const eventIdFromPath = isEventDetail ? Number(pathParts[2]) : NaN;

  if (req.method === "PATCH" && isBookDetail) {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");

      if (!Number.isInteger(bookIdFromPath) || bookIdFromPath <= 0) {
        send(res, 400, { error: "invalid_book_id" });
        return;
      }

      const title = payload.title === undefined ? undefined : String(payload.title).trim();
      const description = payload.description === undefined ? undefined : String(payload.description).trim();
      const url =
        payload.url === undefined && payload.book_url === undefined
          ? undefined
          : String(payload.url || payload.book_url || "").trim();

      if (title !== undefined && !title) {
        send(res, 400, { error: "invalid_title" });
        return;
      }
      if (description !== undefined && !description) {
        send(res, 400, { error: "invalid_description" });
        return;
      }
      if (url !== undefined && !isValidHttpUrl(url)) {
        send(res, 400, { error: "invalid_url" });
        return;
      }

      const updates = [];
      const values = [];
      let index = 1;

      if (title !== undefined) {
        updates.push(`title = $${index++}`);
        values.push(title);
      }
      if (description !== undefined) {
        updates.push(`description = $${index++}`);
        values.push(description);
      }
      if (url !== undefined) {
        updates.push(`book_url = $${index++}`);
        values.push(url);
      }

      if (updates.length === 0) {
        send(res, 400, { error: "no_fields_to_update" });
        return;
      }

      updates.push("updated_at = NOW()");
      values.push(bookIdFromPath);

      const result = await pool.query(
        `UPDATE books
         SET ${updates.join(", ")}
         WHERE id = $${index}
         RETURNING id, title, description, book_url, created_at, updated_at`,
        values
      );

      if (result.rowCount === 0) {
        send(res, 404, { error: "not_found" });
        return;
      }

      clearBooksCache();
      send(res, 200, { ok: true, book: result.rows[0] });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "DELETE" && isBookDetail) {
    try {
      if (!Number.isInteger(bookIdFromPath) || bookIdFromPath <= 0) {
        send(res, 400, { error: "invalid_book_id" });
        return;
      }

      const result = await pool.query("DELETE FROM books WHERE id = $1 RETURNING id", [bookIdFromPath]);
      if (result.rowCount === 0) {
        send(res, 404, { error: "not_found" });
        return;
      }

      clearBooksCache();
      send(res, 200, { ok: true, deletedId: bookIdFromPath });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "PATCH" && isEventDetail) {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");

      if (!Number.isInteger(eventIdFromPath) || eventIdFromPath <= 0) {
        send(res, 400, { error: "invalid_event_id" });
        return;
      }

      const title = payload.title === undefined ? undefined : String(payload.title).trim();
      const description = payload.description === undefined ? undefined : String(payload.description).trim();
      const dateConfirmed =
        payload.dateConfirmed === undefined && payload.date_confirmed === undefined
          ? undefined
          : Boolean(payload.dateConfirmed ?? payload.date_confirmed);
      const date = payload.date === undefined ? undefined : String(payload.date).trim();
      const time = payload.time === undefined ? undefined : String(payload.time).trim();
      const venue = payload.venue === undefined ? undefined : String(payload.venue).trim();
      const ticketingUrl =
        payload.ticketingUrl === undefined && payload.ticketing_url === undefined
          ? undefined
          : String(payload.ticketingUrl || payload.ticketing_url || "").trim();
      const url =
        payload.url === undefined && payload.event_url === undefined
          ? undefined
          : String(payload.url || payload.event_url || "").trim();
      const timezone = payload.timezone === undefined ? undefined : String(payload.timezone).trim();

      if (title !== undefined && !title) {
        send(res, 400, { error: "invalid_title" });
        return;
      }
      if (description !== undefined && !description) {
        send(res, 400, { error: "invalid_description" });
        return;
      }
      if (venue !== undefined && !venue) {
        send(res, 400, { error: "invalid_venue" });
        return;
      }
      if (date !== undefined && !isValidDate(date)) {
        send(res, 400, { error: "invalid_date" });
        return;
      }
      if (time !== undefined && !isValidTime(time)) {
        send(res, 400, { error: "invalid_time" });
        return;
      }
      if (ticketingUrl !== undefined && !isValidHttpUrl(ticketingUrl)) {
        send(res, 400, { error: "invalid_ticketing_url" });
        return;
      }
      if (url !== undefined && !isValidHttpUrl(url)) {
        send(res, 400, { error: "invalid_url" });
        return;
      }
      if (timezone !== undefined && !isValidTimezone(timezone)) {
        send(res, 400, { error: "invalid_timezone" });
        return;
      }

      const updates = [];
      const values = [];
      let index = 1;

      if (title !== undefined) {
        updates.push(`title = $${index++}`);
        values.push(title);
      }
      if (description !== undefined) {
        updates.push(`description = $${index++}`);
        values.push(description);
      }
      if (dateConfirmed !== undefined) {
        updates.push(`date_confirmed = $${index++}`);
        values.push(dateConfirmed);
      }
      if (date !== undefined) {
        updates.push(`event_date = $${index++}::date`);
        values.push(date);
      }
      if (time !== undefined) {
        updates.push(`event_time = $${index++}::time`);
        values.push(time);
      }
      if (venue !== undefined) {
        updates.push(`venue = $${index++}`);
        values.push(venue);
      }
      if (ticketingUrl !== undefined) {
        updates.push(`ticketing_url = $${index++}`);
        values.push(ticketingUrl);
      }
      if (url !== undefined) {
        updates.push(`event_url = $${index++}`);
        values.push(url);
      }
      if (timezone !== undefined) {
        updates.push(`timezone = $${index++}`);
        values.push(timezone);
      }

      if (updates.length === 0) {
        send(res, 400, { error: "no_fields_to_update" });
        return;
      }

      updates.push("updated_at = NOW()");
      values.push(eventIdFromPath);

      const result = await pool.query(
        `UPDATE events
         SET ${updates.join(", ")}
         WHERE id = $${index}
         RETURNING id, title, description, date_confirmed, event_date, event_time, venue, ticketing_url, event_url, timezone, created_at, updated_at`,
        values
      );

      if (result.rowCount === 0) {
        send(res, 404, { error: "not_found" });
        return;
      }

      send(res, 200, { ok: true, event: result.rows[0] });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "DELETE" && isEventDetail) {
    try {
      if (!Number.isInteger(eventIdFromPath) || eventIdFromPath <= 0) {
        send(res, 400, { error: "invalid_event_id" });
        return;
      }

      const result = await pool.query("DELETE FROM events WHERE id = $1 RETURNING id", [eventIdFromPath]);
      if (result.rowCount === 0) {
        send(res, 404, { error: "not_found" });
        return;
      }
      send(res, 200, { ok: true, deletedId: eventIdFromPath });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  const isPostDetail = pathParts.length >= 3 && pathParts[0] === "api" && pathParts[1] === "posts";
  const slugFromPath = isPostDetail ? decodeURIComponent(pathParts[2] || "").toLowerCase() : "";

  if (req.method === "GET" && isPostDetail && pathParts.length === 3) {
    if (!slugFromPath || !isValidSlug(slugFromPath)) {
      send(res, 400, { error: "invalid_slug" });
      return;
    }
    try {
      const result = await pool.query(
        `SELECT slug, markdown_path, title, summary, content_md, tags, timezone, status, scheduled_at, published_at, created_at, updated_at
         FROM posts
         WHERE slug = $1
         LIMIT 1`,
        [slugFromPath]
      );
      if (result.rowCount === 0) {
        send(res, 404, { error: "not_found" });
        return;
      }
      send(res, 200, { post: result.rows[0] });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "PATCH" && isPostDetail && pathParts.length === 4 && pathParts[3] === "schedule") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const scheduledAt = String(payload.scheduledAt || "").trim();

      if (!slugFromPath || !isValidSlug(slugFromPath)) {
        send(res, 400, { error: "invalid_slug" });
        return;
      }
      if (!scheduledAt || Number.isNaN(Date.parse(scheduledAt))) {
        send(res, 400, { error: "invalid_scheduled_at" });
        return;
      }

      const scheduled = await pool.query(
        `UPDATE posts
         SET status = 'scheduled',
             scheduled_at = $2::timestamptz,
             published_at = NULL,
             updated_at = NOW()
         WHERE slug = $1
         RETURNING slug, status, scheduled_at`,
        [slugFromPath, scheduledAt]
      );
      if (scheduled.rowCount === 0) {
        send(res, 404, { error: "not_found" });
        return;
      }

      send(res, 200, { ok: true, post: scheduled.rows[0] });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "POST" && isPostDetail && pathParts.length === 4 && pathParts[3] === "publish") {
    try {
      if (!slugFromPath || !isValidSlug(slugFromPath)) {
        send(res, 400, { error: "invalid_slug" });
        return;
      }

      const result = await pool.query(
        `UPDATE posts
         SET status = 'published',
             published_at = COALESCE(published_at, NOW()),
             updated_at = NOW()
         WHERE slug = $1
         RETURNING slug, status, published_at`,
        [slugFromPath]
      );
      if (result.rowCount === 0) {
        send(res, 404, { error: "not_found" });
        return;
      }
      send(res, 200, { ok: true, post: result.rows[0] });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  const isScheduledPostsPath = parsed.pathname === "/api/scheduled-posts" || parsed.pathname === "/scheduled-posts";

  if (req.method === "GET" && isScheduledPostsPath) {
    try {
      const result = await pool.query(
        `SELECT slug, markdown_path, title, summary, content_md, tags, scheduled_at, timezone, status, published_at, updated_at
         FROM posts
         WHERE status = 'scheduled'
         ORDER BY scheduled_at ASC`
      );
      send(res, 200, { posts: result.rows });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "POST" && isScheduledPostsPath) {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");

      const slug = String(payload.slug || "").trim().toLowerCase();
      const markdownPathRaw = String(payload.markdownPath || "").trim();
      const markdownPath = markdownPathRaw || `db://${slug}`;
      const title = String(payload.title || "").trim();
      const summary = String(payload.summary || "").trim();
      const contentMd = String(payload.contentMd || payload.content_md || "").trim();
      const tags = Array.isArray(payload.tags)
        ? payload.tags.map((item) => String(item).trim().toLowerCase()).filter(Boolean)
        : [];
      const scheduledAt = String(payload.scheduledAt || "").trim();
      const timezone = String(payload.timezone || "Europe/Madrid").trim();
      const status = String(payload.status || "scheduled").trim();

      if (!slug || !isValidSlug(slug)) {
        send(res, 400, { error: "invalid_slug" });
        return;
      }
      if (!markdownPath.startsWith("db://") && !markdownPath.includes("content/posts/")) {
        send(res, 400, { error: "invalid_markdown_path" });
        return;
      }
      if (!scheduledAt || Number.isNaN(Date.parse(scheduledAt))) {
        send(res, 400, { error: "invalid_scheduled_at" });
        return;
      }
      if (!isValidTimezone(timezone)) {
        send(res, 400, { error: "invalid_timezone" });
        return;
      }
      if (!["scheduled", "published"].includes(status)) {
        send(res, 400, { error: "invalid_status" });
        return;
      }

      const scheduledResult = await pool.query(
        `INSERT INTO posts (slug, markdown_path, title, summary, content_md, tags, scheduled_at, timezone, status, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6::text[], $7::timestamptz, $8, $9, NOW())
         ON CONFLICT (slug)
         DO UPDATE SET
           markdown_path = EXCLUDED.markdown_path,
           title = COALESCE(NULLIF(EXCLUDED.title, ''), posts.title),
           summary = COALESCE(NULLIF(EXCLUDED.summary, ''), posts.summary),
           content_md = COALESCE(NULLIF(EXCLUDED.content_md, ''), posts.content_md),
           tags = CASE WHEN array_length(EXCLUDED.tags, 1) IS NULL THEN posts.tags ELSE EXCLUDED.tags END,
           scheduled_at = EXCLUDED.scheduled_at,
           timezone = EXCLUDED.timezone,
           status = EXCLUDED.status,
           published_at = CASE WHEN EXCLUDED.status = 'scheduled' THEN NULL ELSE posts.published_at END,
           updated_at = NOW()
         RETURNING slug, scheduled_at, status`,
        [slug, markdownPath, title, summary, contentMd, tags, scheduledAt, timezone, status]
      );

      send(res, 200, { ok: true, post: scheduledResult.rows[0] });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  if (req.method === "POST" && parsed.pathname === "/api/likes") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const slug = String(payload.slug || "").trim().toLowerCase();

      if (!slug || !isValidSlug(slug)) {
        send(res, 400, { error: "invalid_slug" });
        return;
      }

      const result = await pool.query(
        `INSERT INTO post_likes (slug, likes_count, updated_at)
         VALUES ($1, 1, NOW())
         ON CONFLICT (slug)
         DO UPDATE SET likes_count = post_likes.likes_count + 1, updated_at = NOW()
         RETURNING likes_count`,
        [slug]
      );

      send(res, 200, { ok: true, slug, likes: result.rows[0]?.likes_count ?? 1 });
      return;
    } catch {
      send(res, 500, { error: "db_error" });
      return;
    }
  }

  const isSubscribePath =
    parsed.pathname === "/api/subscribers" ||
    parsed.pathname === "/api/subscribe" ||
    parsed.pathname === "/subscribers";

  if (req.method !== "POST" || !isSubscribePath) {
    send(res, 404, { error: "not_found" });
    return;
  }

  try {
    const body = await readBody(req);
    const payload = JSON.parse(body || "{}");
    const email = String(payload.email || "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      send(res, 400, { error: "invalid_email" });
      return;
    }

    const result = await pool.query(
      "INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING id",
      [email]
    );

    if (result.rowCount === 0) {
      send(res, 409, { error: "duplicate" });
      return;
    }

    send(res, 200, { ok: true });
  } catch {
    send(res, 500, { error: "db_error" });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Subscribe API listening on port ${port}`);
});
