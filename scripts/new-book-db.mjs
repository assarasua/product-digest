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

const title = readArg("--title");
const label = readArg("--label");
const description = readArg("--description");
const url = readArg("--url");
const imageUrl = readArg("--imageUrl");

if (!title || !description || !url) {
  console.error(
    "Usage: npm run new:book:db -- --title <title> --description <description> --url <url> [--imageUrl <url>]"
  );
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 15000),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 10000)
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS books (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL,
    book_url TEXT NOT NULL,
    image_url TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);
await pool.query(`ALTER TABLE books ADD COLUMN IF NOT EXISTS label TEXT NOT NULL DEFAULT ''`);
await pool.query(`ALTER TABLE books ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT ''`);
await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS books_title_lower_uidx ON books (lower(title))`);

const result = await pool.query(
  `INSERT INTO books (title, label, description, book_url, image_url, updated_at)
   VALUES ($1, $2, $3, $4, $5, NOW())
   ON CONFLICT (lower(title))
   DO UPDATE SET
     label = COALESCE(NULLIF(EXCLUDED.label, ''), books.label),
     description = EXCLUDED.description,
     book_url = EXCLUDED.book_url,
     image_url = COALESCE(NULLIF(EXCLUDED.image_url, ''), books.image_url),
     updated_at = NOW()
   RETURNING id, title, label, description, book_url, image_url, created_at, updated_at`,
  [title, label, description, url, imageUrl]
);

await pool.end();
console.log(JSON.stringify({ ok: true, book: result.rows[0] }, null, 2));
