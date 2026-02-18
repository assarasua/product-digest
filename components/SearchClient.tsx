"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { formatDate } from "@/lib/format";
import type { SearchDocument } from "@/lib/search-index";

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchDocument[]>([]);

  useEffect(() => {
    fetch("/search-index.json")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SearchDocument[]) => setDocs(data))
      .catch(() => setDocs([]));
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
        Buscar articulos
      </label>
      <input
        id="search-input"
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Prueba: priorizacion, onboarding, roadmap..."
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
