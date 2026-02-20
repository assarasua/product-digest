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

  parsed.data.draft = false;
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
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
      scheduled_at TIMESTAMPTZ NULL,
      published_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

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

  const dueFromPosts = await pool.query(
    `UPDATE posts
     SET status = 'published',
         published_at = COALESCE(published_at, NOW()),
         updated_at = NOW()
     WHERE status = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= NOW()
     RETURNING slug, scheduled_at`
  );

  if (dueFromPosts.rowCount === 0) {
    console.log("No scheduled posts are due.");
    await pool.end();
    return;
  }

  const publishedBySlug = new Map(
    dueFromPosts.rows.map((row) => [String(row.slug), new Date(row.scheduled_at).toISOString()])
  );

  await pool.query(
    `UPDATE scheduled_posts
     SET status = 'published',
         published_at = NOW(),
         updated_at = NOW()
     WHERE slug = ANY($1::text[]) AND status = 'scheduled'`,
    [Array.from(publishedBySlug.keys())]
  );

  let publishedCount = 0;
  for (const [slug, scheduledAt] of publishedBySlug.entries()) {
    if (updateMdx) {
      let filePath = resolveMarkdownPath(
        String(
          (
            await pool.query(`SELECT markdown_path FROM scheduled_posts WHERE slug = $1 LIMIT 1`, [slug])
          ).rows[0]?.markdown_path || ""
        )
      );

      if (!filePath || !fs.existsSync(filePath)) {
        const fallbackName = findMarkdownBySlug(slug);
        if (!fallbackName) {
          console.warn(`Skipping MDX sync for ${slug}: markdown file not found.`);
          publishedCount += 1;
          continue;
        }
        filePath = path.join(postsDir, fallbackName);
      }

      const updatedPath = updateMarkdown(filePath, scheduledAt, slug);
      const markdownPath = relativeToRoot(updatedPath);
      await pool.query(
        `UPDATE scheduled_posts
         SET markdown_path = $1,
             updated_at = NOW()
         WHERE slug = $2`,
        [markdownPath, slug]
      );
      console.log(`Published scheduled post: ${slug} (${markdownPath})`);
    } else {
      console.log(`Published scheduled post in DB: ${slug}`);
    }
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
