import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "content/posts");
const outputPath = path.join(process.cwd(), "public/search-index.json");

function toSlug(fileName) {
  const base = fileName.replace(/\.mdx?$/, "");
  const match = base.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  return match ? match[1] : base;
}

function toDateString(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value ?? "");
}

function stripMdx(value) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[>#*_~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, "[]\n");
  process.exit(0);
}

const docs = fs
  .readdirSync(postsDir)
  .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
  .map((fileName) => {
    const source = fs.readFileSync(path.join(postsDir, fileName), "utf8");
    const { data, content } = matter(source);

    if (data.draft === true) {
      return null;
    }

    return {
      slug: toSlug(fileName),
      title: String(data.title ?? "Untitled"),
      summary: String(data.summary ?? ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      date: toDateString(data.date),
      text: stripMdx(content).slice(0, 6000)
    };
  })
  .filter(Boolean)
  .sort((a, b) => b.date.localeCompare(a.date));

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(docs, null, 2)}\n`);
console.log(`Generated ${docs.length} search documents at ${outputPath}`);
