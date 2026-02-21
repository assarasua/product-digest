import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 15000),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 10000)
});

const events = [
  {
    title: "La Product Conf Paris",
    description: "La conferencia anual en la que los amantes del Producto conectan y aprenden",
    dateConfirmed: true,
    date: "2026-05-19",
    time: "09:00",
    venue: "Paris",
    ticketingUrl: "https://www.accelevents.com/e/u/checkout/la-product-conf-paris-2026/tickets/order",
    url: "https://www.laproductconf.com/paris/lpc",
    timezone: "Europe/Paris"
  },
  {
    title: "TRGCON",
    description:
      "La TRG es una conferencia sobre diseño, desarrollo y comercialización de servicios digitales que nace alrededor de la hiperactiva Comunidad de suscriptores de La Bonilista, una newsletter semanal sobre emprendimiento tecnológico escrita por David Bonilla.",
    dateConfirmed: true,
    date: "2026-10-22",
    time: "09:00",
    venue: "Madrid",
    ticketingUrl: "https://trgcon.com/",
    url: "https://trgcon.com/",
    timezone: "Europe/Madrid"
  },
  {
    title: "Product Fest",
    description: "El festival hecho por y para profesionales del producto digital",
    dateConfirmed: false,
    // Fecha técnica para ordenar/persistir en DB; en UI se muestra TBD.
    date: "2026-12-31",
    time: "09:00",
    venue: "TBD",
    ticketingUrl: "https://productfest.es/",
    url: "https://productfest.es/",
    timezone: "Europe/Madrid"
  }
];

events.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

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
await pool.query(`CREATE INDEX IF NOT EXISTS events_date_time_idx ON events (event_date, event_time)`);
await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS date_confirmed BOOLEAN NOT NULL DEFAULT TRUE`);

for (const event of events) {
  const existing = await pool.query(
    "SELECT id FROM events WHERE lower(title)=lower($1) AND event_date=$2::date LIMIT 1",
    [event.title, event.date]
  );

  if (existing.rowCount && existing.rowCount > 0) {
    await pool.query(
      `UPDATE events
       SET description = $1,
           date_confirmed = $2,
           event_time = $3::time,
           venue = $4,
           ticketing_url = $5,
           event_url = $6,
           timezone = $7,
           updated_at = NOW()
       WHERE id = $8`,
      [
        event.description,
        event.dateConfirmed,
        event.time,
        event.venue,
        event.ticketingUrl,
        event.url,
        event.timezone,
        existing.rows[0].id
      ]
    );
  } else {
    await pool.query(
      `INSERT INTO events (title, description, date_confirmed, event_date, event_time, venue, ticketing_url, event_url, timezone, updated_at)
       VALUES ($1, $2, $3, $4::date, $5::time, $6, $7, $8, $9, NOW())`,
      [
        event.title,
        event.description,
        event.dateConfirmed,
        event.date,
        event.time,
        event.venue,
        event.ticketingUrl,
        event.url,
        event.timezone
      ]
    );
  }
}

const inserted = await pool.query(
  `SELECT title, date_confirmed, event_date, event_time, venue
   FROM events
   WHERE lower(title) IN (lower($1), lower($2), lower($3))
   ORDER BY event_date ASC, event_time ASC`,
  ["La Product Conf Paris", "TRGCON", "Product Fest"]
);

console.log(JSON.stringify({ ok: true, events: inserted.rows }, null, 2));
await pool.end();
