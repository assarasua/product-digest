import type { MetadataRoute } from "next";

import { getAllPostsFromApi } from "@/lib/posts-api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://productdigest.es";
  const posts = await getAllPostsFromApi();

  const staticPages = ["", "/product-leaders-wiki", "/eventos", "/libros", "/archive", "/search", "/about"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date()
  }));

  const postPages = posts.map((post) => ({
    url: `${siteUrl}/post/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.date)
  }));

  return [...staticPages, ...postPages];
}
