import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

function readArg(flag, fallback = "") {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return fallback;
  return String(process.argv[idx + 1] || "").trim();
}

const slug = readArg("--slug").toLowerCase();
const author = readArg("--author") || "Editorial";
const origin = (readArg("--origin") || "ia").toLowerCase();
const title = readArg("--title");
const summary = readArg("--summary");
const scheduledAt = readArg("--scheduledAt") || null;
const tagsRaw = readArg("--tags");
const contentFile = readArg("--contentFile");
const contentText = readArg("--content");

const tags = tagsRaw
  ? tagsRaw
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
  : [];

const contentMd = contentFile
  ? fs.readFileSync(path.resolve(contentFile), "utf8")
  : contentText || "Borrador inicial.";

if (!slug || !title || !summary) {
  console.error(
    "Usage: npm run new:post:db -- --slug <slug> --title <title> --summary <summary> --scheduledAt <ISO> [--tags a,b] [--contentFile <path>|--content <text>]"
  );
  process.exit(1);
}

if (!scheduledAt || Number.isNaN(Date.parse(scheduledAt))) {
  console.error("Missing or invalid --scheduledAt. Use ISO date-time.");
  process.exit(1);
}
if (!["ia", "humano"].includes(origin)) {
  console.error("Invalid --origin. Use ia|humano.");
  process.exit(1);
}

const status = "scheduled";

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

const result = await pool.query(
  `INSERT INTO posts (slug, markdown_path, author, origin, title, summary, content_md, tags, status, scheduled_at, timezone, updated_at)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text[], $9, $10::timestamptz, $11, NOW())
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
     timezone = EXCLUDED.timezone,
     updated_at = NOW()
   RETURNING slug, author, origin, status, scheduled_at`,
  [
    slug,
    `db://${slug}`,
    author,
    origin,
    title,
    summary,
    contentMd,
    tags,
    status,
    scheduledAt,
    process.env.SCHEDULE_TIMEZONE || "Europe/Madrid"
  ]
);

await pool.end();
console.log(JSON.stringify({ ok: true, post: result.rows[0] }, null, 2));
