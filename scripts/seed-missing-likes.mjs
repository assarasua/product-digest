import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

function randomLikes(min = 20, max = 125) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 15000),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 10000)
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS post_likes (
    slug TEXT PRIMARY KEY,
    likes_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

const missing = await pool.query(`
  SELECT p.slug
  FROM posts p
  LEFT JOIN post_likes l ON l.slug = p.slug
  WHERE l.slug IS NULL
`);

if (missing.rowCount === 0) {
  console.log("No posts without likes found.");
  await pool.end();
  process.exit(0);
}

for (const row of missing.rows) {
  const likes = randomLikes(20, 125);
  await pool.query(
    `INSERT INTO post_likes (slug, likes_count, updated_at)
     VALUES ($1, $2, NOW())`,
    [String(row.slug), likes]
  );
}

await pool.end();
console.log(`Seeded likes (20-125) for ${missing.rowCount} post(s) without likes.`);
