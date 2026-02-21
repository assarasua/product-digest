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
const imageUrlArg = readArg("--imageUrl");

if (!title || !description || !url) {
  console.error(
    "Usage: npm run new:book:db -- --title <title> --description <description> --url <url> [--imageUrl <url>]"
  );
  process.exit(1);
}

function isAmazonHost(hostname) {
  return hostname === "amzn.to" || hostname.includes("amazon.");
}

function extractAmazonAsin(urlValue) {
  try {
    const parsed = new URL(urlValue);
    if (!isAmazonHost(parsed.hostname.toLowerCase())) return "";
    const source = `${parsed.pathname}${parsed.search}`;
    const patterns = [
      /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i,
      /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
      /\/gp\/aw\/d\/([A-Z0-9]{10})(?:[/?]|$)/i,
      /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})(?:[/?]|$)/i,
      /[?&]asin=([A-Z0-9]{10})(?:[&]|$)/i
    ];
    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (match?.[1]) return match[1].toUpperCase();
    }
    return "";
  } catch {
    return "";
  }
}

async function deriveBookImageUrl(urlValue) {
  const asinDirect = extractAmazonAsin(urlValue);
  if (asinDirect) return `https://images-na.ssl-images-amazon.com/images/P/${asinDirect}.01._SL500_.jpg`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(urlValue, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; ProductDigestBot/1.0)"
      }
    });
    clearTimeout(timeoutId);
    const asin = extractAmazonAsin(response.url || urlValue);
    return asin ? `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL500_.jpg` : "";
  } catch {
    return "";
  }
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
    image_url TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);
await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS books_title_lower_uidx ON books (lower(title))`);
await pool.query(`ALTER TABLE books ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT ''`);

const imageUrl = imageUrlArg || (await deriveBookImageUrl(url));

const result = await pool.query(
  `INSERT INTO books (title, description, book_url, image_url, updated_at)
   VALUES ($1, $2, $3, $4, NOW())
   ON CONFLICT (lower(title))
   DO UPDATE SET
     description = EXCLUDED.description,
     book_url = EXCLUDED.book_url,
     image_url = EXCLUDED.image_url,
     updated_at = NOW()
   RETURNING id, title, description, book_url, image_url, created_at, updated_at`,
  [title, description, url, imageUrl]
);

await pool.end();
console.log(JSON.stringify({ ok: true, book: result.rows[0] }, null, 2));
