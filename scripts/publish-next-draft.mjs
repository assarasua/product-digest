import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "content/posts");
const searchIndexScript = path.join(process.cwd(), "scripts/generate-search-index.mjs");
const skipSearchIndex = process.env.PUBLISH_SKIP_SEARCH_INDEX === "1";

function toDateString(value) {
  if (!value) {
    return "9999-12-31";
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value);
}

function findNextDraft() {
  if (!fs.existsSync(postsDir)) {
    return null;
  }

  const candidates = fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((fileName) => {
      const fullPath = path.join(postsDir, fileName);
      const source = fs.readFileSync(fullPath, "utf8");
      const parsed = matter(source);
      return {
        fileName,
        fullPath,
        parsed,
        date: toDateString(parsed.data.date)
      };
    })
    .filter((item) => item.parsed.data.draft === true)
    .sort((a, b) => {
      const byDate = a.date.localeCompare(b.date);
      return byDate !== 0 ? byDate : a.fileName.localeCompare(b.fileName);
    });

  return candidates[0] ?? null;
}

async function publishNextDraft() {
  const next = findNextDraft();

  if (!next) {
    console.log("No hay articulos en draft para publicar.");
    return;
  }

  next.parsed.data.draft = false;
  const output = matter.stringify(next.parsed.content, next.parsed.data);
  fs.writeFileSync(next.fullPath, output);

  // Keep search index aligned when the site is served without a fresh build.
  if (!skipSearchIndex && fs.existsSync(searchIndexScript)) {
    const { spawnSync } = await import("node:child_process");
    spawnSync(process.execPath, [searchIndexScript], { stdio: "inherit" });
  }

  console.log(`Publicado: ${next.fileName}`);
}

await publishNextDraft();
