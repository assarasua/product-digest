import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { HomeFeedPagination } from "@/components/HomeFeedPagination";
import { PostCard } from "@/components/PostCard";
import { getAllPostsFromApi } from "@/lib/posts-api";
import { ogImageUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Últimos artículos sobre gestión de producto, AI PM y estrategia SaaS.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Product Digest",
    description: "Últimos artículos sobre gestión de producto, AI PM y estrategia SaaS.",
    url: "/",
    type: "website",
    images: [{ url: ogImageUrl("Product Digest", "Ideas prácticas para construir mejores productos") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Digest",
    description: "Últimos artículos sobre gestión de producto, AI PM y estrategia SaaS.",
    images: [ogImageUrl("Product Digest", "Ideas prácticas para construir mejores productos")]
  }
};

export default async function HomePage() {
  const posts = await getAllPostsFromApi();

  return (
    <div className="page-wrap">
      <section className="hero">
        <p className="eyebrow">Escritura diaria de producto</p>
        <h1>Ideas prácticas para construir mejores productos.</h1>
        <p>
          Este blog reúne marcos, decisiones y análisis aplicables para equipos de producto en etapa de crecimiento.
        </p>
        <p>
          <Link href="/product-leaders-wiki">Ir a Product Leaders</Link>
        </p>
      </section>

      <Suspense
        fallback={
          <section className="feed-grid" aria-label="Ultimos artículos">
            {posts.slice(0, 5).map((post, index) => (
              <PostCard key={post.slug} post={post} index={index} />
            ))}
          </section>
        }
      >
        <HomeFeedPagination posts={posts} />
      </Suspense>
    </div>
  );
}
