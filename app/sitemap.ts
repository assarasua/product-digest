import type { MetadataRoute } from "next";

import { getAllPostsFromApi, getAllTagsFromApi } from "@/lib/posts-api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://productdigest.es";
  const posts = await getAllPostsFromApi();
  const tags = await getAllTagsFromApi();

  const staticPages = ["", "/product-leaders-wiki", "/tags", "/archive", "/search", "/about", "/privacy"].map(
    (path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date()
    })
  );

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
