export type Heading = {
  id: string;
  level: 2 | 3;
  text: string;
};

export type Post = {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  status?: "scheduled" | "published";
  publishAt?: string;
  coverImage?: string;
  imageDescription?: string;
  imageLink?: string;
  updatedAt?: string;
  slug: string;
  readingTimeMinutes: number;
  headings: Heading[];
  previewText: string;
  body: string;
};

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

function getPostsApiBaseUrl(): string {
  return (
    process.env.POSTS_API_BASE_URL ||
    process.env.NEXT_PUBLIC_POSTS_API_BASE_URL ||
    "https://api.productdigest.es"
  ).replace(/\/+$/, "");
}

function postFromRaw(raw: {
  slug: string;
  title: string;
  summary: string;
  tags?: unknown;
  content_md?: string;
  status?: string;
  published_at?: string;
  scheduled_at?: string;
  updated_at?: string;
}): Post {
  const body = String(raw.content_md ?? "").trim();
  const date = normalizeDate(raw.published_at ?? raw.scheduled_at ?? new Date().toISOString());
  const updatedAt = normalizeDate(raw.updated_at ?? date);
  const tags = normalizeStringArray(raw.tags);
  const words = stripMdx(body).split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.round(words / 220));

  return {
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
    readingTimeMinutes
  };
}

async function fetchPublishedPosts(): Promise<Post[]> {
  const url = `${getPostsApiBaseUrl()}/api/posts?status=published&limit=1000`;
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) {
    return [];
  }
  const payload = (await response.json()) as { posts?: unknown[] };
  return Array.isArray(payload.posts)
    ? payload.posts
        .map((post) => postFromRaw(post as Parameters<typeof postFromRaw>[0]))
        .filter((post) => post.slug)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];
}

export async function getPostBySlugFromApi(slug: string): Promise<Post | undefined> {
  const posts = await fetchPublishedPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getPostsByTagFromApi(tag: string): Promise<Post[]> {
  const posts = await fetchPublishedPosts();
  return posts.filter((post) => post.tags.includes(tag));
}
