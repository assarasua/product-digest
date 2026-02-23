"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PostCard } from "@/components/PostCard";
import type { Post } from "@/lib/posts-api";

const POSTS_PER_PAGE = 5;

export function HomeFeedPagination({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams();
  const query = String(searchParams.get("q") ?? "").trim().toLowerCase();
  const selectedTopic = String(searchParams.get("topic") ?? "").trim().toLowerCase();
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const allTopics = [...new Set(posts.flatMap((post) => post.tags))].sort((a, b) => a.localeCompare(b));

  const filteredPosts = posts.filter((post) => {
    const byTopic = selectedTopic ? post.tags.includes(selectedTopic) : true;
    if (!byTopic) return false;
    if (!query) return true;

    const haystack = [post.title, post.summary, post.previewText, post.body, post.tags.join(" ")]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0 ? Math.min(Math.floor(requestedPage), totalPages) : 1;
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const visiblePosts = filteredPosts.slice(start, start + POSTS_PER_PAGE);

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedTopic) params.set("topic", selectedTopic);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <>
      <section className="home-filters" aria-label="Filtrar artículos">
        <form action="/" method="get" className="home-filters-form">
          <div className="home-filter-field">
            <label htmlFor="home-filter-q">Buscar en artículos</label>
            <input
              id="home-filter-q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Buscar por tema o contenido"
              className="search-input"
            />
          </div>
          <div className="home-filter-field">
            <label htmlFor="home-filter-topic">Tema</label>
            <select id="home-filter-topic" name="topic" defaultValue={selectedTopic} className="search-input">
              <option value="">Todos los temas</option>
              {allTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
          <div className="home-filter-actions">
            <button type="submit" className="newsletter-button">
              Filtrar
            </button>
            <Link href="/" className="pagination-link">
              Limpiar
            </Link>
          </div>
        </form>
        <p className="search-meta">{filteredPosts.length} artículo(s) encontrado(s).</p>
      </section>

      <section className="feed-grid" aria-label="Ultimos artículos">
        {visiblePosts.map((post, index) => (
          <PostCard key={post.slug} post={post} index={index} />
        ))}
        {visiblePosts.length === 0 ? <p className="empty-state">No hay artículos para ese filtro.</p> : null}
      </section>

      <nav className="pagination" aria-label="Paginacion de artículos">
        {currentPage > 1 ? (
          <Link className="pagination-link" href={buildPageHref(currentPage - 1)}>
            ← Anterior
          </Link>
        ) : (
          <span className="pagination-link is-disabled">← Anterior</span>
        )}
        <span className="pagination-status">
          Pagina {currentPage} de {totalPages}
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
