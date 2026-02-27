import type { Metadata } from "next";
import { Suspense } from "react";

import { HomeFeedPagination } from "@/components/HomeFeedPagination";
import { PostCard } from "@/components/PostCard";
import { getAllPostsFromApi } from "@/lib/posts-api";
import { ogImageUrl } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Human Insights",
  description: "Artículos escritos por humanos sobre estrategia y ejecución de producto.",
  alternates: {
    canonical: "/product-builders"
  },
  openGraph: {
    title: "Human Insights | Product Digest",
    description: "Artículos escritos por humanos sobre estrategia y ejecución de producto.",
    url: "/product-builders",
    type: "website",
    images: [{ url: ogImageUrl("Human Insights", "Aprendizajes humanos para construir producto") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Human Insights | Product Digest",
    description: "Artículos escritos por humanos sobre estrategia y ejecución de producto.",
    images: [ogImageUrl("Human Insights", "Aprendizajes humanos para construir producto")]
  }
};

export default async function ProductBuildersPage() {
  const posts = (await getAllPostsFromApi()).filter((post) => post.origin === "humano");

  return (
    <div className="page-wrap">
      <section className="hero">
        <p className="eyebrow">Human Insights</p>
        <h1>Perspectiva humana para construir mejores productos.</h1>
        <p>Contenido escrito por personas para compartir experiencia real en producto.</p>
      </section>

      {posts.length === 0 ? (
        <section className="feed-grid" aria-label="Artículos Product Builders">
          <p className="summary">Todavía no hay artículos humanos publicados.</p>
        </section>
      ) : (
        <Suspense
          fallback={
            <section className="feed-grid" aria-label="Artículos Product Builders">
              {posts.slice(0, 5).map((post, index) => (
                <PostCard key={post.slug} post={post} index={index} />
              ))}
            </section>
          }
        >
          <HomeFeedPagination posts={posts} basePath="/product-builders" />
        </Suspense>
      )}
    </div>
  );
}
