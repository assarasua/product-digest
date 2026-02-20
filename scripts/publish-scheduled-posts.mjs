import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import matter from "gray-matter";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const rootDir = process.cwd();
const postsDir = path.join(rootDir, "content/posts");
const searchIndexScript = path.join(rootDir, "scripts/generate-search-index.mjs");
const skipSearchIndex = process.env.PUBLISH_SKIP_SEARCH_INDEX === "1";
const updateMdx = process.env.PUBLISH_UPDATE_MDX === "1";

function toDateString(isoDateTime) {
  return new Date(isoDateTime).toISOString().slice(0, 10);
}

function resolveMarkdownPath(markdownPath) {
  if (!markdownPath) return null;
  if (path.isAbsolute(markdownPath)) return markdownPath;
  return path.join(rootDir, markdownPath);
}

function relativeToRoot(filePath) {
  return path.relative(rootDir, filePath).replaceAll("\\", "/");
}

function findMarkdownBySlug(slug) {
  const entries = fs.readdirSync(postsDir).filter((name) => name.endsWith(".mdx") || name.endsWith(".md"));
  return entries.find((name) => name.endsWith(`-${slug}.mdx`) || name.endsWith(`-${slug}.md`)) ?? null;
}

function updateMarkdown(filePath, scheduledAtIso, slug) {
  const source = fs.readFileSync(filePath, "utf8");
  const parsed = matter(source);
  const date = toDateString(scheduledAtIso);

  parsed.data.status = "published";
  delete parsed.data.draft;
  parsed.data.date = date;
  parsed.data.publishAt = new Date(scheduledAtIso).toISOString();
  parsed.data.updatedAt = date;

  const output = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(filePath, output, "utf8");

  const ext = path.extname(filePath);
  const currentName = path.basename(filePath);
  const targetName = `${date}-${slug}${ext}`;
  if (currentName === targetName) {
    return filePath;
  }

  const targetPath = path.join(path.dirname(filePath), targetName);
  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
  }
  fs.renameSync(filePath, targetPath);
  return targetPath;
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
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      content_md TEXT NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published')),
      scheduled_at TIMESTAMPTZ NULL,
      published_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id BIGSERIAL PRIMARY KEY
    )
  `);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS markdown_path TEXT NOT NULL DEFAULT ''`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Europe/Madrid'`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS summary TEXT`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS content_md TEXT`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`);

  const dueScheduled = await pool.query(
    `SELECT id, slug, markdown_path, title, summary, content_md, tags, scheduled_at
     FROM posts
     WHERE status = 'scheduled' AND scheduled_at <= NOW()
     ORDER BY scheduled_at ASC`
  );

  if (dueScheduled.rowCount === 0) {
    console.log("No scheduled posts are due.");
    await pool.end();
    return;
  }

  let publishedCount = 0;
  for (const row of dueScheduled.rows) {
    const slug = String(row.slug);
    const scheduledAt = new Date(row.scheduled_at).toISOString();
    let title = String(row.title || "").trim();
    let summary = String(row.summary || "").trim();
    let contentMd = String(row.content_md || "").trim();
    let tags = Array.isArray(row.tags) ? row.tags.map((item) => String(item).toLowerCase()) : [];
    let filePath = resolveMarkdownPath(String(row.markdown_path || ""));

    if ((!title || !summary || !contentMd || tags.length === 0) && (!filePath || !fs.existsSync(filePath))) {
      const fallbackName = findMarkdownBySlug(slug);
      if (fallbackName) {
        filePath = path.join(postsDir, fallbackName);
      }
    }

    if ((!title || !summary || !contentMd || tags.length === 0) && filePath && fs.existsSync(filePath)) {
      const source = fs.readFileSync(filePath, "utf8");
      const parsed = matter(source);
      title = title || String(parsed.data.title || slug);
      summary = summary || String(parsed.data.summary || "");
      contentMd = contentMd || String(parsed.content || "");
      tags = tags.length > 0
        ? tags
        : Array.isArray(parsed.data.tags)
          ? parsed.data.tags.map((item) => String(item).toLowerCase())
          : [];
    }

    if (updateMdx) {
      if (filePath && fs.existsSync(filePath)) {
      const updatedPath = updateMarkdown(filePath, scheduledAt, slug);
      const markdownPath = relativeToRoot(updatedPath);
      await pool.query(
        `UPDATE posts
           SET markdown_path = $1,
               title = COALESCE(NULLIF($2, ''), title),
               summary = COALESCE(NULLIF($3, ''), summary),
               content_md = COALESCE(NULLIF($4, ''), content_md),
               tags = CASE WHEN array_length($5::text[], 1) IS NULL THEN tags ELSE $5::text[] END,
               updated_at = NOW()
           WHERE slug = $6`,
        [markdownPath, title, summary, contentMd, tags, slug]
      );
      }
    }

    if (!title || !summary || !contentMd) {
      console.warn(`Skipping ${slug}: missing title/summary/content.`);
      continue;
    }

    await pool.query(
      `UPDATE posts
       SET status = 'published',
           published_at = NOW(),
           title = COALESCE(NULLIF($1, ''), title),
           summary = COALESCE(NULLIF($2, ''), summary),
           content_md = COALESCE(NULLIF($3, ''), content_md),
           tags = CASE WHEN array_length($4::text[], 1) IS NULL THEN tags ELSE $4::text[] END,
           updated_at = NOW()
       WHERE id = $5`,
      [title, summary, contentMd, tags, row.id]
    );

    console.log(`Published scheduled post: ${slug}`);
    publishedCount += 1;
  }

  if (publishedCount > 0 && updateMdx && !skipSearchIndex && fs.existsSync(searchIndexScript)) {
    spawnSync(process.execPath, [searchIndexScript], { stdio: "inherit" });
  }

  await pool.end();
  console.log(`Scheduled publish complete. Published ${publishedCount} post(s).`);
}

try {
  await run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`publish-scheduled-posts failed: ${message}`);
  process.exit(1);
}
