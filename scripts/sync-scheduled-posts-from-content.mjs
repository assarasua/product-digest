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
const defaultTime = process.env.SCHEDULE_DEFAULT_TIME || "07:00:00";

function buildDefaultScheduledAt(dateValue) {
  const date = String(dateValue || "").slice(0, 10);
  if (!date) return null;
  return `${date}T${defaultTime}+01:00`;
}

function extractSlug(fileName) {
  const base = fileName.replace(/\.mdx?$/, "");
  const match = base.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  return match ? match[1] : base;
}

async function run() {
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
      title TEXT,
      summary TEXT,
      content_md TEXT,
      tags TEXT[] DEFAULT '{}',
      scheduled_at TIMESTAMPTZ NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'Europe/Madrid',
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published')),
      published_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS markdown_path TEXT NOT NULL DEFAULT ''`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT 'Editorial'`);
  await pool.query(`UPDATE posts SET author = 'Editorial' WHERE author IS NULL OR btrim(author) = ''`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'ia'`);
  await pool.query(`UPDATE posts SET origin = 'ia' WHERE origin IS NULL OR btrim(origin) = ''`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS summary TEXT`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS content_md TEXT`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Europe/Madrid'`);

  const files = fs.readdirSync(postsDir).filter((name) => name.endsWith(".mdx") || name.endsWith(".md"));
  let synced = 0;

  for (const fileName of files) {
    const fullPath = path.join(postsDir, fileName);
    const parsed = matter(fs.readFileSync(fullPath, "utf8"));
    const status = String(parsed.data.status || "").toLowerCase();
    const isScheduled = status === "scheduled" || parsed.data.draft === true;
    if (!isScheduled) continue;

    const slug = extractSlug(fileName);
    const markdownPath = path.relative(rootDir, fullPath).replaceAll("\\", "/");
    const scheduledAt = parsed.data.publishAt || buildDefaultScheduledAt(parsed.data.date);
    if (!scheduledAt || Number.isNaN(Date.parse(scheduledAt))) {
      synced += 1;
      continue;
    }

    const author = String(parsed.data.author || "Editorial");
    const origin = String(parsed.data.origin || "ia").toLowerCase() === "humano" ? "humano" : "ia";
    const title = String(parsed.data.title || slug);
    const summary = String(parsed.data.summary || "");
    const contentMd = String(parsed.content || "");
    const tags = Array.isArray(parsed.data.tags) ? parsed.data.tags.map((tag) => String(tag).toLowerCase()) : [];

    await pool.query(
      `INSERT INTO posts (slug, markdown_path, author, origin, title, summary, content_md, tags, scheduled_at, timezone, status, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text[], $9::timestamptz, $10, 'scheduled', NOW())
       ON CONFLICT (slug)
       DO UPDATE SET
         markdown_path = EXCLUDED.markdown_path,
         author = EXCLUDED.author,
         origin = EXCLUDED.origin,
         title = EXCLUDED.title,
         summary = EXCLUDED.summary,
         content_md = EXCLUDED.content_md,
         tags = EXCLUDED.tags,
         scheduled_at = EXCLUDED.scheduled_at,
         timezone = EXCLUDED.timezone,
         status = CASE
           WHEN posts.status = 'published' THEN posts.status
           ELSE 'scheduled'
         END,
         updated_at = NOW()`,
      [slug, markdownPath, author, origin, title, summary, contentMd, tags, scheduledAt, defaultTimezone]
    );

    synced += 1;
  }

  await pool.end();
  console.log(`Synced ${synced} scheduled post(s) into posts.`);
}

try {
  await run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`sync-scheduled-posts-from-content failed: ${message}`);
  process.exit(1);
}
