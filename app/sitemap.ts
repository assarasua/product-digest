import type { MetadataRoute } from "next";

import { getAllPostsRuntime, getAllTagsRuntime } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://productdigest.es";
  const posts = await getAllPostsRuntime();
  const tags = await getAllTagsRuntime();

  const staticPages = ["", "/product-leaders-wiki", "/tags", "/archive", "/search", "/about"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date()
  }));

  const postPages = posts.map((post) => ({
    url: `${siteUrl}/post/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.date)
  }));

  const tagPages = tags.map(({ tag }) => ({
    url: `${siteUrl}/tag/${encodeURIComponent(tag)}`,
    lastModified: new Date()
  }));

  return [...staticPages, ...postPages, ...tagPages];
}
