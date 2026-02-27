import type { MetadataRoute } from "next";

import { getAllPostsFromApi } from "@/lib/posts-api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://productdigest.es";
  const posts = await getAllPostsFromApi();

  const staticPages = [
    "",
    "/cookies",
    "/product-builders",
    "/product-leaders-wiki",
    "/eventos",
    "/libros",
    "/archive",
    "/about"
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date()
  }));

  const postPages = posts.map((post) => ({
    url: `${siteUrl}/post/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.date)
  }));

  return [...staticPages, ...postPages];
}
