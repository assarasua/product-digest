import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const rootDir = process.cwd();
const postsDir = path.join(rootDir, "content/posts");
const defaultTimezone = process.env.SCHEDULE_TIMEZONE || "Europe/Madrid";

function extractSlug(fileName) {
  const base = fileName.replace(/\.mdx?$/, "");
  const match = base.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  return match ? match[1] : base;
}

function toIsoDateTime(value, fallbackHour = "08:00:00") {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (!Number.isNaN(Date.parse(raw))) {
    return new Date(raw).toISOString();
  }

  const dateOnly = raw.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    return new Date(`${dateOnly}T${fallbackHour}Z`).toISOString();
  }
  return null;
}

async function run() {
  if (!fs.existsSync(postsDir)) {
    console.log("No content/posts directory found. Nothing to migrate.");
    return;
  }

  const files = fs
    .readdirSync(postsDir)
    .filter((name) => name.endsWith(".mdx") || name.endsWith(".md"))
    .sort();

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 15000),
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 10000)
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id BIGSERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      markdown_path TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'Editorial',
      origin TEXT NOT NULL DEFAULT 'ia' CHECK (origin IN ('ia', 'humano')),
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      content_md TEXT NOT NULL,
      tags TEXT[] DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published')),
      scheduled_at TIMESTAMPTZ NULL,
      published_at TIMESTAMPTZ NULL,
      timezone TEXT NOT NULL DEFAULT 'Europe/Madrid',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let migrated = 0;

  for (const fileName of files) {
    const source = fs.readFileSync(path.join(postsDir, fileName), "utf8");
    const parsed = matter(source);
    const slug = extractSlug(fileName);
    const status =
      String(parsed.data.status || "").toLowerCase() === "scheduled" || parsed.data.draft === true
        ? "scheduled"
        : "published";
    const publishAt = toIsoDateTime(parsed.data.publishAt || parsed.data.date);
    const scheduledAt = status === "scheduled" ? publishAt : null;
    const publishedAt = status === "published" ? publishAt : null;

    const author = String(parsed.data.author || "Editorial");
    const origin = String(parsed.data.origin || "ia").toLowerCase() === "humano" ? "humano" : "ia";
    const title = String(parsed.data.title || slug);
    const summary = String(parsed.data.summary || "");
    const contentMd = String(parsed.content || "");
    const tags = Array.isArray(parsed.data.tags) ? parsed.data.tags.map((tag) => String(tag).toLowerCase()) : [];

    await pool.query(
      `INSERT INTO posts
        (slug, markdown_path, author, origin, title, summary, content_md, tags, status, scheduled_at, published_at, timezone, updated_at)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8::text[], $9, $10::timestamptz, $11::timestamptz, $12, NOW())
       ON CONFLICT (slug)
       DO UPDATE SET
         markdown_path = EXCLUDED.markdown_path,
         author = EXCLUDED.author,
         origin = EXCLUDED.origin,
         title = EXCLUDED.title,
         summary = EXCLUDED.summary,
         content_md = EXCLUDED.content_md,
         tags = EXCLUDED.tags,
         status = EXCLUDED.status,
         scheduled_at = EXCLUDED.scheduled_at,
         published_at = COALESCE(posts.published_at, EXCLUDED.published_at),
         timezone = EXCLUDED.timezone,
         updated_at = NOW()`,
      [slug, `db://${slug}`, author, origin, title, summary, contentMd, tags, status, scheduledAt, publishedAt, defaultTimezone]
    );

    migrated += 1;
  }

  const count = await pool.query("SELECT COUNT(*)::int AS total FROM posts");
  await pool.end();

  console.log(`Migrated ${migrated} post file(s) into DB.`);
  console.log(`DB now contains ${count.rows[0]?.total ?? 0} total post row(s).`);
}

try {
  await run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`migrate-content-posts-to-db failed: ${message}`);
  process.exit(1);
}
