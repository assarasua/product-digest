import type { MetadataRoute } from "next";

import { getAllPosts, getAllTags } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://productdigest.es";

  const staticPages = ["", "/product-leaders-wiki", "/tags", "/archive", "/search", "/about"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date()
  }));

  const postPages = getAllPosts().map((post) => ({
    url: `${siteUrl}/post/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.date)
  }));

  const tagPages = getAllTags().map(({ tag }) => ({
    url: `${siteUrl}/tag/${encodeURIComponent(tag)}`,
    lastModified: new Date()
  }));

  return [...staticPages, ...postPages, ...tagPages];
}
