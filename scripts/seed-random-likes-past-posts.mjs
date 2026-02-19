import fs from "node:fs";
import path from "node:path";

import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const postsDir = path.join(process.cwd(), "content/posts");
const today = new Date().toISOString().slice(0, 10);
const args = new Set(process.argv.slice(2));
const includeToday = args.has("--include-today");

function randomLikes() {
  return Math.floor(Math.random() * 91) + 10; // 10-100
}

function extractSlug(fileName) {
  const base = fileName.replace(/\.mdx?$/, "");
  const match = base.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  return match ? match[1] : null;
}

function extractDate(fileName) {
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})-/);
  return match ? match[1] : null;
}

const files = fs
  .readdirSync(postsDir)
  .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
  .filter((file) => {
    const date = extractDate(file);
    if (!date) return false;
    return includeToday ? date <= today : date < today;
  });

const rows = files
  .map((file) => {
    const slug = extractSlug(file);
    if (!slug) return null;
    return {
      slug,
      likes: randomLikes()
    };
  })
  .filter(Boolean);

if (rows.length === 0) {
  console.log("No past posts found to seed.");
  process.exit(0);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS post_likes (
    slug TEXT PRIMARY KEY,
    likes_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

for (const row of rows) {
  await pool.query(
    `INSERT INTO post_likes (slug, likes_count, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (slug)
     DO UPDATE SET likes_count = EXCLUDED.likes_count, updated_at = NOW()`,
    [row.slug, row.likes]
  );
}

await pool.end();

console.log(
  `Seeded random likes for ${rows.length} post(s) (${includeToday ? "including today" : "past only"}).`
);
