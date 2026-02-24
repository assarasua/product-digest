import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

const postsDir = path.join(process.cwd(), "content/posts");
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
let cachedPosts: Post[] | null = null;
let cachedRemotePosts: Post[] | null = null;

const dateFieldSchema = z
  .union([z.string(), z.date()])
  .transform((value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value))
  .refine((value) => isoDateRegex.test(value), "Expected YYYY-MM-DD");

const frontmatterSchema = z.object({
  author: z.string().min(1).optional(),
  origin: z.enum(["ia", "humano"]).optional(),
  title: z.string().min(1),
  date: dateFieldSchema,
  summary: z.string().min(1),
  tags: z.array(z.string().min(1)),
  status: z.enum(["scheduled", "published"]).optional(),
  draft: z.boolean().optional(),
  publishAt: z.string().optional(),
  coverImage: z.string().optional(),
  imageDescription: z.string().optional(),
  imageLink: z.string().optional(),
  updatedAt: dateFieldSchema.optional()
});

export type Heading = {
  id: string;
  level: 2 | 3;
  text: string;
};

export type PostMeta = z.infer<typeof frontmatterSchema> & {
  slug: string;
  readingTimeMinutes: number;
  headings: Heading[];
  previewText: string;
};

export type Post = PostMeta & {
  body: string;
};

function toSlug(fileName: string): string {
  const base = fileName.replace(/\.mdx?$/, "");
  const match = base.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  return match ? match[1] : base;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function extractHeadings(content: string): Heading[] {
  const lines = content.split("\n");
  const headings: Heading[] = [];

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);

    if (h2) {
      headings.push({ id: slugify(h2[1]), level: 2, text: h2[1] });
    } else if (h3) {
      headings.push({ id: slugify(h3[1]), level: 3, text: h3[1] });
    }
  }

  return headings;
}

function stripMdx(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPreviewText(summary: string, body: string): string {
  const cleanSummary = summary.trim();
  if (cleanSummary.length >= 90) {
    return cleanSummary;
  }

  const cleanBody = stripMdx(body);
  if (!cleanBody) {
    return cleanSummary;
  }

  const maxChars = 220;
  if (cleanBody.length <= maxChars) {
    return cleanBody;
  }

  const sliced = cleanBody.slice(0, maxChars);
  const end = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, end > 80 ? end : maxChars).trim()}...`;
}

function normalizeDate(value: unknown): string {
  if (typeof value !== "string" || !value) {
    return new Date().toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
}

function postFromRaw(raw: {
  slug: string;
  author?: string;
  origin?: string;
  title: string;
  summary: string;
  tags?: unknown;
  content_md?: string;
  contentMd?: string;
  status?: string;
  published_at?: string;
  scheduled_at?: string;
  updated_at?: string;
  updatedAt?: string;
  date?: string;
}): Post {
  const body = String(raw.content_md ?? raw.contentMd ?? "").trim();
  const date = normalizeDate(raw.published_at ?? raw.scheduled_at ?? raw.date ?? new Date().toISOString());
  const updatedAt = normalizeDate(raw.updated_at ?? raw.updatedAt ?? date);
  const tags = normalizeStringArray(raw.tags);
  const stats = readingTime(body);

  return {
    author: String(raw.author || "Editorial"),
    origin: String(raw.origin || "ia").toLowerCase() === "humano" ? "humano" : "ia",
    title: String(raw.title || raw.slug),
    date,
    summary: String(raw.summary || ""),
    tags,
    status: raw.status === "scheduled" ? "scheduled" : "published",
    updatedAt,
    slug: String(raw.slug || ""),
    body,
    headings: extractHeadings(body),
    previewText: buildPreviewText(String(raw.summary || ""), body),
    readingTimeMinutes: Math.max(1, Math.round(stats.minutes))
  };
}

function getPostsApiBaseUrl(): string {
  return resolveApiBaseUrl(
    process.env.POSTS_API_BASE_URL,
    process.env.NEXT_PUBLIC_POSTS_API_BASE_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL
  );
}

export async function getRemotePublishedPosts(): Promise<Post[]> {
  if (cachedRemotePosts) {
    return cachedRemotePosts;
  }

  const apiBase = getPostsApiBaseUrl();
  const url = `${apiBase}/api/posts?status=published&limit=1000`;

  const response = await fetchWithTimeout(url, { next: { revalidate: 60 } }, 5000);

  if (!response.ok) {
    throw new Error(`remote_posts_failed_${response.status}`);
  }

  const payload = (await response.json()) as { posts?: unknown[] };
  const posts = Array.isArray(payload.posts)
    ? payload.posts
        .map((post) => postFromRaw(post as Parameters<typeof postFromRaw>[0]))
        .filter((post) => post.slug && post.status === "published")
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  cachedRemotePosts = posts;
  return posts;
}

function parsePostFile(fileName: string): Post {
  const fullPath = path.join(postsDir, fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid frontmatter in ${fileName}: ${details}`);
  }

  const stats = readingTime(content);

  return {
    ...parsed.data,
    author: parsed.data.author || "Editorial",
    origin: parsed.data.origin ?? "ia",
    status: parsed.data.status ?? (parsed.data.draft === true ? "scheduled" : "published"),
    slug: toSlug(fileName),
    body: content,
    headings: extractHeadings(content),
    previewText: buildPreviewText(parsed.data.summary, content),
    readingTimeMinutes: Math.max(1, Math.round(stats.minutes))
  };
}

function getPostFiles(): string[] {
  if (!fs.existsSync(postsDir)) {
    return [];
  }

  return fs.readdirSync(postsDir).filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));
}

export function getAllPosts(): Post[] {
  if (cachedPosts) {
    return cachedPosts;
  }

  cachedPosts = getPostFiles()
    .map(parsePostFile)
    .filter((post) => post.status === "published")
    .sort((a, b) => b.date.localeCompare(a.date));

  if (process.env.CONTENT_DEBUG === "1") {
    console.log(`[content] parsed ${cachedPosts.length} published post(s)`);
  }

  return cachedPosts;
}

export async function getAllPostsRuntime(): Promise<Post[]> {
  try {
    return await getRemotePublishedPosts();
  } catch (error) {
    console.error("[content] failed to load published posts from API", error);
    return [];
  }
}

export function getAllPostSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

export async function getPostBySlugRuntime(slug: string): Promise<Post | undefined> {
  const posts = await getAllPostsRuntime();
  return posts.find((post) => post.slug === slug);
}

export function getAllTags() {
  const counts = new Map<string, number>();

  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

export async function getAllTagsRuntime() {
  const counts = new Map<string, number>();

  for (const post of await getAllPostsRuntime()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

export async function getPostsByTagRuntime(tag: string): Promise<Post[]> {
  const posts = await getAllPostsRuntime();
  return posts.filter((post) => post.tags.includes(tag));
}

export function getArchive() {
  const archive = new Map<string, Post[]>();

  for (const post of getAllPosts()) {
    const key = post.date.slice(0, 7);
    if (!archive.has(key)) {
      archive.set(key, []);
    }
    archive.get(key)?.push(post);
  }

  return [...archive.entries()].map(([month, posts]) => ({ month, posts }));
}

export async function getArchiveRuntime() {
  const archive = new Map<string, Post[]>();
  for (const post of await getAllPostsRuntime()) {
    const key = post.date.slice(0, 7);
    if (!archive.has(key)) {
      archive.set(key, []);
    }
    archive.get(key)?.push(post);
  }
  return [...archive.entries()].map(([month, posts]) => ({ month, posts }));
}
