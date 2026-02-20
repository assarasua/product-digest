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
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 10000)
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
  CREATE TABLE IF NOT EXISTS scheduled_posts (
    id BIGSERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    markdown_path TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Europe/Madrid',
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'published')),
    published_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

function send(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type"
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

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type"
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
        "GET /api/scheduled-posts",
        "POST /api/scheduled-posts"
      ]
    });
    return;
  }

  if (req.method === "GET" && parsed.pathname === "/healthz") {
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

  const isScheduledPostsPath = parsed.pathname === "/api/scheduled-posts" || parsed.pathname === "/scheduled-posts";

  if (req.method === "GET" && isScheduledPostsPath) {
    try {
      const result = await pool.query(
        `SELECT slug, markdown_path, scheduled_at, timezone, status, published_at, updated_at
         FROM scheduled_posts
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
      const markdownPath = String(payload.markdownPath || "").trim();
      const scheduledAt = String(payload.scheduledAt || "").trim();
      const timezone = String(payload.timezone || "Europe/Madrid").trim();
      const status = String(payload.status || "scheduled").trim();

      if (!slug || !isValidSlug(slug)) {
        send(res, 400, { error: "invalid_slug" });
        return;
      }
      if (!markdownPath || !markdownPath.includes("content/posts/")) {
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
      if (!["draft", "scheduled", "published"].includes(status)) {
        send(res, 400, { error: "invalid_status" });
        return;
      }

      await pool.query(
        `INSERT INTO scheduled_posts (slug, markdown_path, scheduled_at, timezone, status, updated_at)
         VALUES ($1, $2, $3::timestamptz, $4, $5, NOW())
         ON CONFLICT (slug)
         DO UPDATE SET
           markdown_path = EXCLUDED.markdown_path,
           scheduled_at = EXCLUDED.scheduled_at,
           timezone = EXCLUDED.timezone,
           status = EXCLUDED.status,
           updated_at = NOW()`,
        [slug, markdownPath, scheduledAt, timezone, status]
      );

      send(res, 200, { ok: true, slug, scheduledAt, status });
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
