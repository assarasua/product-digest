import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "subscribers.db");
const databaseUrl = process.env.DATABASE_URL;
let pgPool: { query: (sql: string, params?: unknown[]) => Promise<unknown> } | null = null;
let pgInitPromise: Promise<void> | null = null;

function ensureDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  return db;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function loadPgModule() {
  const dynamicImport = new Function("s", "return import(s)") as (specifier: string) => Promise<unknown>;
  return (await dynamicImport("pg")) as { Pool: new (options: { connectionString: string; ssl: { rejectUnauthorized: boolean } }) => { query: (sql: string, params?: unknown[]) => Promise<unknown> } };
}

function getPgPool() {
  if (!databaseUrl) {
    return null;
  }
  if (!pgPool) {
    return null;
  }
  return pgPool;
}

async function ensurePgPool() {
  if (!databaseUrl) {
    return null;
  }
  if (!pgPool) {
    const pg = await loadPgModule();
    pgPool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pgPool;
}

async function ensurePgTable() {
  if (!databaseUrl) {
    return;
  }
  if (!pgInitPromise) {
    const pool = await ensurePgPool();
    if (!pool) {
      return;
    }
    pgInitPromise = pool
      .query(`
        CREATE TABLE IF NOT EXISTS subscribers (
          id BIGSERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `)
      .then(() => undefined);
  }
  await pgInitPromise;
}

async function addSubscriberPostgres(email: string) {
  const pool = await ensurePgPool();
  if (!pool) {
    return { ok: false as const, code: "pg_missing" as const };
  }

  await ensurePgTable();

  try {
    await pool.query("INSERT INTO subscribers (email) VALUES ($1)", [email]);
    return { ok: true as const, email };
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    if (code === "23505") {
      return { ok: false as const, code: "duplicate" as const };
    }
    return { ok: false as const, code: "db_error" as const };
  }
}

function addSubscriberSqlite(email: string) {
  const db = ensureDb();

  try {
    db.prepare("INSERT INTO subscribers (email) VALUES (?)").run(email);
    return { ok: true as const, email };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("unique")) {
      return { ok: false as const, code: "duplicate" as const };
    }
    return { ok: false as const, code: "db_error" as const };
  } finally {
    db.close();
  }
}

export async function addSubscriber(rawEmail: string) {
  const email = normalizeEmail(rawEmail);

  if (databaseUrl) {
    return addSubscriberPostgres(email);
  }

  return addSubscriberSqlite(email);
}
