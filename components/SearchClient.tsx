"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { formatDate } from "@/lib/format";
import type { SearchDocument } from "@/lib/search-index";

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchDocument[]>([]);

  useEffect(() => {
    const apiBase = resolveApiBaseUrl(
      process.env.NEXT_PUBLIC_POSTS_API_BASE_URL,
      process.env.NEXT_PUBLIC_API_BASE_URL
    );
    fetch(`${apiBase}/api/posts?status=published&limit=1000`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("posts_api_error");
        }
        return (await res.json()) as { posts?: Array<Record<string, unknown>> };
      })
      .then((payload) => {
        const mapped: SearchDocument[] = Array.isArray(payload.posts)
          ? payload.posts.map((post) => {
              const rawDate = String(post.published_at ?? post.scheduled_at ?? post.updated_at ?? "");
              const date = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
              const tags = Array.isArray(post.tags) ? post.tags.map((tag) => String(tag)) : [];
              const body = String(post.content_md ?? "");
              const summary = String(post.summary ?? "");
              return {
                slug: String(post.slug ?? ""),
                title: String(post.title ?? ""),
                summary,
                tags,
                text: `${summary} ${body}`.trim(),
                date
              };
            })
          : [];
        setDocs(mapped.filter((doc) => doc.slug && doc.title));
      })
      .catch(() => {
        setDocs([]);
      });
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return docs.slice(0, 12);
    }

    return docs
      .filter((doc) => {
        const haystack = `${doc.title} ${doc.summary} ${doc.tags.join(" ")} ${doc.text}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 40);
  }, [docs, query]);

  return (
    <section className="search-wrap">
      <label htmlFor="search-input" className="search-label">
        Buscar artículos
      </label>
      <input
        id="search-input"
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Prueba: priorización, onboarding, roadmap..."
        className="search-input"
      />

      <p className="search-meta">{results.length} resultado(s)</p>

      {results.length === 0 ? <p className="empty-state">No se encontraron coincidencias.</p> : null}

      <div className="search-results">
        {results.map((result) => (
          <article key={result.slug} className="post-card">
            <p className="meta-row">{formatDate(result.date)}</p>
            <h2>
              <Link href={`/post/${result.slug}`}>{result.title}</Link>
            </h2>
            <p className="summary">{result.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
