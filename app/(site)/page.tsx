import type { Metadata } from "next";
import Link from "next/link";

import { NewsletterSignup } from "@/components/NewsletterSignup";
import { PostCard } from "@/components/PostCard";
import { getAllPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Ultimos articulos sobre gestion de producto, AI PM y estrategia SaaS."
};

const POSTS_PER_PAGE = 5;

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const posts = getAllPosts();
  const params = await searchParams;
  const requestedPage = Number(params.page ?? "1");
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0 ? Math.min(Math.floor(requestedPage), totalPages) : 1;
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const visiblePosts = posts.slice(start, start + POSTS_PER_PAGE);

  return (
    <div className="page-wrap">
      <section className="hero">
        <p className="eyebrow">Escritura diaria de producto</p>
        <h1>Ideas practicas para construir mejores productos.</h1>
        <p>
          Esta bitacora reune marcos, decisiones y analisis aplicables para equipos de producto en etapa de crecimiento.
        </p>
      </section>

      <section className="feed-grid" aria-label="Ultimos articulos">
        {visiblePosts.map((post, index) => (
          <PostCard key={post.slug} post={post} index={index} />
        ))}
      </section>

      <nav className="pagination" aria-label="Paginacion de articulos">
        {currentPage > 1 ? (
          <Link className="pagination-link" href={currentPage - 1 === 1 ? "/" : `/?page=${currentPage - 1}`}>
            ← Anterior
          </Link>
        ) : (
          <span className="pagination-link is-disabled">← Anterior</span>
        )}
        <span className="pagination-status">
          Pagina {currentPage} de {totalPages}
        </span>
        {currentPage < totalPages ? (
          <Link className="pagination-link" href={`/?page=${currentPage + 1}`}>
            Siguiente →
          </Link>
        ) : (
          <span className="pagination-link is-disabled">Siguiente →</span>
        )}
      </nav>

      <NewsletterSignup />
    </div>
  );
}
