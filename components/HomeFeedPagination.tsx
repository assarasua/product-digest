"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PostCard } from "@/components/PostCard";
import type { Post } from "@/lib/content";

const POSTS_PER_PAGE = 5;

export function HomeFeedPagination({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams();
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0 ? Math.min(Math.floor(requestedPage), totalPages) : 1;
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const visiblePosts = posts.slice(start, start + POSTS_PER_PAGE);

  return (
    <>
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
    </>
  );
}
