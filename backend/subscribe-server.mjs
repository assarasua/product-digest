import http from "node:http";
import { URL } from "node:url";

const port = Number(process.env.PORT || 8788);
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const pg = await import("pg");
const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS subscribers (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

function send(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload));
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  if (req.method === "GET" && parsed.pathname === "/healthz") {
    send(res, 200, { ok: true });
    return;
  }

  const isSubscribePath =
    parsed.pathname === "/api/subscribers" ||
    parsed.pathname === "/api/subscribe" ||
    parsed.pathname === "/subscribers";

  if (req.method !== "POST" || !isSubscribePath) {
    send(res, 404, { error: "not_found" });
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const payload = JSON.parse(body || "{}");
      const email = String(payload.email || "").trim().toLowerCase();

      if (!email || !isValidEmail(email)) {
        send(res, 400, { error: "invalid_email" });
        return;
      }

      const result = await pool.query(
        "INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING id",
        [email]
      );

      if (result.rowCount === 0) {
        send(res, 409, { error: "duplicate" });
        return;
      }

      send(res, 200, { ok: true });
    } catch {
      send(res, 500, { error: "db_error" });
    }
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Subscribe API listening on port ${port}`);
});
