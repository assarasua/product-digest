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
const description = readArg("--description");
const url = readArg("--url");

if (!title || !description || !url) {
  console.error("Usage: npm run new:book:db -- --title <title> --description <description> --url <url>");
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
    description TEXT NOT NULL,
    book_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);
await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS books_title_lower_uidx ON books (lower(title))`);

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

await pool.end();
console.log(JSON.stringify({ ok: true, book: result.rows[0] }, null, 2));
