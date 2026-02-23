"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { Post } from "@/lib/posts-api";
import { formatDate, formatMonth } from "@/lib/format";

function buildArchive(posts: Post[]) {
  const byMonth = new Map<string, Post[]>();

  for (const post of posts) {
    const month = post.date.slice(0, 7);
    if (!byMonth.has(month)) {
      byMonth.set(month, []);
    }
    byMonth.get(month)?.push(post);
  }

  return [...byMonth.entries()].map(([month, monthPosts]) => ({ month, posts: monthPosts }));
}

export function ArchiveFilterList({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams();
  const query = String(searchParams.get("q") ?? "").trim().toLowerCase();
  const selectedTopic = String(searchParams.get("topic") ?? "").trim().toLowerCase();
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

  const archive = buildArchive(filteredPosts);

  return (
    <>
      <section className="home-filters" aria-label="Filtrar artículos en archivo">
        <form action="/archive" method="get" className="home-filters-form">
          <div className="home-filter-field">
            <label htmlFor="archive-filter-q">Buscar por contenido</label>
            <input
              id="archive-filter-q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Buscar por tema o contenido"
              className="search-input"
            />
          </div>
          <div className="home-filter-field">
            <label htmlFor="archive-filter-topic">Tema</label>
            <select id="archive-filter-topic" name="topic" defaultValue={selectedTopic} className="search-input">
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
            <Link href="/archive" className="pagination-link">
              Limpiar
            </Link>
          </div>
        </form>
        <p className="search-meta">{filteredPosts.length} artículo(s) encontrado(s).</p>
      </section>

      <div className="archive-list">
        {archive.map(({ month, posts: monthPosts }) => (
          <section key={month} className="archive-month">
            <h2>
              {formatMonth(month)} <span className="archive-count">({monthPosts.length})</span>
            </h2>
            <ul>
              {monthPosts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/post/${post.slug}`} className="archive-title">
                    {post.title}
                  </Link>
                  <span className="archive-date">{formatDate(post.date)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {archive.length === 0 ? <p className="empty-state">No hay artículos para ese filtro.</p> : null}
      </div>
    </>
  );
}
