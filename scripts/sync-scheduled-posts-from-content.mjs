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

  const files = fs.readdirSync(postsDir).filter((name) => name.endsWith(".mdx") || name.endsWith(".md"));
  let synced = 0;

  for (const fileName of files) {
    const fullPath = path.join(postsDir, fileName);
    const parsed = matter(fs.readFileSync(fullPath, "utf8"));
    if (parsed.data.draft !== true) continue;

    const slug = extractSlug(fileName);
    const markdownPath = path.relative(rootDir, fullPath).replaceAll("\\", "/");
    const scheduledAt = parsed.data.publishAt || buildDefaultScheduledAt(parsed.data.date);
    if (!scheduledAt || Number.isNaN(Date.parse(scheduledAt))) continue;

    await pool.query(
      `INSERT INTO scheduled_posts (slug, markdown_path, scheduled_at, timezone, status, updated_at)
       VALUES ($1, $2, $3::timestamptz, $4, 'scheduled', NOW())
       ON CONFLICT (slug)
       DO UPDATE SET
         markdown_path = EXCLUDED.markdown_path,
         scheduled_at = EXCLUDED.scheduled_at,
         timezone = EXCLUDED.timezone,
         status = CASE
           WHEN scheduled_posts.status = 'published' THEN scheduled_posts.status
           ELSE 'scheduled'
         END,
         updated_at = NOW()`,
      [slug, markdownPath, scheduledAt, defaultTimezone]
    );

    synced += 1;
  }

  await pool.end();
  console.log(`Synced ${synced} draft post(s) into scheduled_posts.`);
}

try {
  await run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`sync-scheduled-posts-from-content failed: ${message}`);
  process.exit(1);
}
