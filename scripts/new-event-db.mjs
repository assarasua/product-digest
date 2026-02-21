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

function parseBoolean(value, fallback = true) {
  if (!value) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "si"].includes(normalized)) return true;
  if (["false", "0", "no"].includes(normalized)) return false;
  return fallback;
}

const title = readArg("--title");
const description = readArg("--description");
const date = readArg("--date");
const time = readArg("--time", "09:00");
const venue = readArg("--venue");
const ticketingUrl = readArg("--ticketingUrl");
const url = readArg("--url");
const timezone = readArg("--timezone", "Europe/Madrid");
const dateConfirmed = parseBoolean(readArg("--dateConfirmed"), true);

if (!title || !description || !date || !time || !venue || !ticketingUrl || !url) {
  console.error(
    "Usage: npm run new:event:db -- --title <title> --description <description> --date <YYYY-MM-DD> --time <HH:MM> --venue <venue> --ticketingUrl <url> --url <url> [--timezone Europe/Madrid] [--dateConfirmed true|false]"
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
  CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    venue TEXT NOT NULL,
    ticketing_url TEXT NOT NULL,
    event_url TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Europe/Madrid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

const result = await pool.query(
  `INSERT INTO events (title, description, date_confirmed, event_date, event_time, venue, ticketing_url, event_url, timezone, updated_at)
   VALUES ($1, $2, $3, $4::date, $5::time, $6, $7, $8, $9, NOW())
   RETURNING id, title, date_confirmed, event_date, event_time, venue, ticketing_url, event_url, timezone`,
  [title, description, dateConfirmed, date, time, venue, ticketingUrl, url, timezone]
);

await pool.end();
console.log(JSON.stringify({ ok: true, event: result.rows[0] }, null, 2));
