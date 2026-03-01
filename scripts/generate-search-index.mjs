import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "content/posts");
const outputPath = path.join(process.cwd(), "public/search-index.json");
const defaultApiBaseUrl = "https://api.productdigest.es";

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

function resolveApiBaseUrl() {
  const values = [
    process.env.POSTS_API_BASE_URL,
    process.env.NEXT_PUBLIC_POSTS_API_BASE_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL
  ];

  for (const value of values) {
    const trimmed = String(value || "").trim();
    if (!trimmed) continue;
    const withProtocol =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : trimmed.startsWith("//")
          ? `https:${trimmed}`
          : `https://${trimmed}`;
    try {
      const parsed = new URL(withProtocol);
      const normalizedPath = parsed.pathname.replace(/\/+$/, "").replace(/\/api$/, "");
      parsed.pathname = normalizedPath || "/";
      parsed.search = "";
      parsed.hash = "";
      return parsed.toString().replace(/\/+$/, "");
    } catch {
      // ignore invalid env values
    }
  }

  return defaultApiBaseUrl;
}

async function getDocsFromApi() {
  const apiBase = resolveApiBaseUrl();
  const response = await fetch(`${apiBase}/api/posts?status=published&limit=1000`);
  if (!response.ok) {
    throw new Error(`API responded with ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload?.posts)) {
    return [];
  }

  return payload.posts
    .map((post) => ({
      slug: String(post.slug || ""),
      title: String(post.title ?? "Untitled"),
      summary: String(post.summary ?? ""),
      tags: Array.isArray(post.tags) ? post.tags.map(String) : [],
      date: toDateString(post.published_at ?? post.scheduled_at ?? post.updated_at ?? ""),
      text: stripMdx(String(post.content_md ?? "")).slice(0, 6000)
    }))
    .filter((post) => post.slug)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function getDocsFromFiles() {
  if (!fs.existsSync(postsDir)) {
    return [];
  }

  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((fileName) => {
      const source = fs.readFileSync(path.join(postsDir, fileName), "utf8");
      const { data, content } = matter(source);

      const effectiveStatus =
        String(data.status || "").toLowerCase() === "scheduled" || data.draft === true
          ? "scheduled"
          : "published";
      if (effectiveStatus !== "published") {
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
}

let docs = [];
try {
  docs = await getDocsFromApi();
} catch {
  docs = getDocsFromFiles();
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(docs, null, 2)}\n`);
console.log(`Generated ${docs.length} search documents at ${outputPath}`);
