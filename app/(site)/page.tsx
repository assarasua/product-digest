import type { Metadata } from "next";
import { Suspense } from "react";

import { HomeFeedPagination } from "@/components/HomeFeedPagination";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { PostCard } from "@/components/PostCard";
import { getAllPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Ultimos articulos sobre gestion de producto, AI PM y estrategia SaaS."
};

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="page-wrap">
      <section className="hero">
        <p className="eyebrow">Escritura diaria de producto</p>
        <h1>Ideas practicas para construir mejores productos.</h1>
        <p>
          Esta bitacora reune marcos, decisiones y analisis aplicables para equipos de producto en etapa de crecimiento.
        </p>
      </section>

      <Suspense
        fallback={
          <section className="feed-grid" aria-label="Ultimos articulos">
            {posts.slice(0, 5).map((post, index) => (
              <PostCard key={post.slug} post={post} index={index} />
            ))}
          </section>
        }
      >
        <HomeFeedPagination posts={posts} />
      </Suspense>

      <NewsletterSignup />
    </div>
  );
}
