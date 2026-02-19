import pg from "pg";

const sourceUrl = "https://www.theawardsmagazine.com/top-50-product-management-influencers-to-follow-in-2024/";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

function decodeHtmlEntities(input) {
  return input
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function stripTags(input) {
  return decodeHtmlEntities(input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function splitName(fullName) {
  const clean = fullName.trim().replace(/\s+/g, " ");
  const parts = clean.split(" ");
  const firstName = parts.shift() ?? clean;
  const lastName = parts.join(" ");
  return { firstName, lastName };
}

function parseLeaders(html) {
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((match) => match[0]);
  const leaders = [];

  for (const table of tables) {
    const imageMatch = table.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/i);
    const linkMatch =
      table.match(/<a[^>]+href="(https:\/\/www\.linkedin\.com\/in\/[^"]+)"/i) ||
      table.match(/<a[^>]+href="(https:\/\/www\.linkedin\.com\/[^"]+)"/i);
    const descMatch = table.match(/<td[^>]*colspan="4"[^>]*>([\s\S]*?)<\/td>/i);
    const nameMatch = table.match(/<span[^>]*font-size:\s*14pt[^>]*>([\s\S]*?)<\/span>/i);
    if (!imageMatch || !linkMatch || !descMatch) {
      continue;
    }

    const fullName = stripTags(imageMatch[2]) || (nameMatch ? stripTags(nameMatch[1]) : "");
    if (!fullName) {
      continue;
    }
    const { firstName, lastName } = splitName(fullName);
    const description = stripTags(descMatch[1]);

    leaders.push({
      firstName,
      lastName,
      imageUrl: imageMatch[1].trim(),
      description,
      profileUrl: linkMatch[1].trim(),
      sourceUrl
    });
  }

  return leaders.slice(0, 50);
}

const response = await fetch(sourceUrl, {
  headers: {
    "User-Agent": "ProductDigestBot/1.0 (+https://productdigest.es)"
  }
});

if (!response.ok) {
  console.error(`Failed to fetch source page: ${response.status}`);
  process.exit(1);
}

const html = await response.text();
const leaders = parseLeaders(html);

if (leaders.length !== 50) {
  console.error(`Expected 50 leaders, parsed ${leaders.length}. Aborting.`);
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS product_leaders (
    id BIGSERIAL PRIMARY KEY,
    rank INTEGER NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    profile_url TEXT NOT NULL,
    source_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await pool.query(`ALTER TABLE product_leaders DROP CONSTRAINT IF EXISTS product_leaders_profile_url_key`);

for (let index = 0; index < leaders.length; index += 1) {
  const leader = leaders[index];
  const rank = index + 1;

  await pool.query(
    `INSERT INTO product_leaders (rank, first_name, last_name, image_url, description, profile_url, source_url, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (rank)
     DO UPDATE SET
       first_name = EXCLUDED.first_name,
       last_name = EXCLUDED.last_name,
       image_url = EXCLUDED.image_url,
       description = EXCLUDED.description,
       profile_url = EXCLUDED.profile_url,
       source_url = EXCLUDED.source_url,
       updated_at = NOW()`,
    [rank, leader.firstName, leader.lastName, leader.imageUrl, leader.description, leader.profileUrl, leader.sourceUrl]
  );
}

await pool.end();

console.log(`Imported ${leaders.length} product leaders from source.`);
