import type { Metadata } from "next";
import { Suspense } from "react";

import { HomeFeedPagination } from "@/components/HomeFeedPagination";
import { PostCard } from "@/components/PostCard";
import { getAllPostsFromApi } from "@/lib/posts-api";
import { ogImageUrl } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hub IA",
  description: "Artículos creados con IA sobre gestión de producto, AI PM y estrategia SaaS.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Hub IA | Product Digest",
    description: "Artículos creados con IA sobre gestión de producto, AI PM y estrategia SaaS.",
    url: "/",
    type: "website",
    images: [{ url: ogImageUrl("Hub IA", "Ideas prácticas para construir mejores productos") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Hub IA | Product Digest",
    description: "Artículos creados con IA sobre gestión de producto, AI PM y estrategia SaaS.",
    images: [ogImageUrl("Hub IA", "Ideas prácticas para construir mejores productos")]
  }
};

export default async function HomePage() {
  const posts = (await getAllPostsFromApi()).filter((post) => post.origin === "ia");

  return (
    <div className="page-wrap">
      <section className="hero">
        <p className="eyebrow">Hub IA</p>
        <h1>Contenido de producto generado con IA.</h1>
        <p>
          Esta sección reúne análisis, marcos y guías creadas con IA para equipos de producto en etapa de crecimiento.
        </p>
      </section>

      <Suspense
        fallback={
          <section className="feed-grid" aria-label="Artículos Hub IA">
            {posts.slice(0, 5).map((post, index) => (
              <PostCard key={post.slug} post={post} index={index} />
            ))}
          </section>
        }
      >
        <HomeFeedPagination posts={posts} basePath="/" />
      </Suspense>
    </div>
  );
}
