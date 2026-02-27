"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PostCard } from "@/components/PostCard";
import type { Post } from "@/lib/posts-api";

const POSTS_PER_PAGE = 5;

function normalizeBasePath(basePath: string): string {
  if (!basePath || basePath === "/") {
    return "/";
  }

  const normalized = basePath.replace(/\/+$/, "");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export function HomeFeedPagination({
  posts,
  basePath,
  pageParam = "page"
}: {
  posts: Post[];
  basePath: string;
  pageParam?: string;
}) {
  const searchParams = useSearchParams();
  const requestedPage = Number(searchParams.get(pageParam) ?? "1");
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0 ? Math.min(Math.floor(requestedPage), totalPages) : 1;
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const visiblePosts = posts.slice(start, start + POSTS_PER_PAGE);
  const normalizedBasePath = normalizeBasePath(basePath);

  const buildPageHref = (targetPage: number) => {
    const query = new URLSearchParams(searchParams.toString());
    if (targetPage <= 1) {
      query.delete(pageParam);
    } else {
      query.set(pageParam, String(targetPage));
    }

    const queryString = query.toString();
    return queryString ? `${normalizedBasePath}?${queryString}` : normalizedBasePath;
  };

  return (
    <>
      <section className="feed-grid" aria-label="Últimos artículos">
        {visiblePosts.map((post, index) => (
          <PostCard key={post.slug} post={post} index={index} />
        ))}
      </section>

      <nav className="pagination" aria-label="Paginación de artículos">
        {currentPage > 1 ? (
          <Link className="pagination-link" href={buildPageHref(currentPage - 1)}>
            ← Anterior
          </Link>
        ) : (
          <span className="pagination-link is-disabled">← Anterior</span>
        )}
        <span className="pagination-status">
          Página {currentPage} de {totalPages}
        </span>
        {currentPage < totalPages ? (
          <Link className="pagination-link" href={buildPageHref(currentPage + 1)}>
            Siguiente →
          </Link>
        ) : (
          <span className="pagination-link is-disabled">Siguiente →</span>
        )}
      </nav>
    </>
  );
}
