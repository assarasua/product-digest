"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveApiBaseUrl } from "@/lib/api-base-url";

type Book = {
  id: number;
  title: string;
  label?: string;
  description: string;
  book_url: string;
  image_url?: string;
};

function getApiBaseUrl(): string {
  return resolveApiBaseUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.NEXT_PUBLIC_POSTS_API_BASE_URL
  );
}

export function BooksClient() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const load = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/books?limit=100&offset=0`, {
          signal: controller.signal
        });
        if (!response.ok) {
          setBooks([]);
          return;
        }

        const payload = (await response.json()) as { books?: Book[] };
        setBooks(Array.isArray(payload.books) ? payload.books : []);
      } catch {
        setBooks([]);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    load();
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return books;

    return books.filter((book) => {
      const haystack = `${book.title} ${book.label ?? ""} ${book.description}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [books, query]);

  if (loading) {
    return <p className="summary">Cargando libros...</p>;
  }

  if (books.length === 0) {
    return <p className="summary">No hay libros disponibles ahora.</p>;
  }

  return (
    <>
      <section className="books-search-wrap" aria-label="Buscar libros">
        <label htmlFor="books-search-input" className="search-label">
          Buscar libros
        </label>
        <input
          id="books-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ej: liderazgo, estrategia, discovery..."
          className="search-input books-search-input"
        />
        <p className="search-meta">{filteredBooks.length} resultado(s)</p>
      </section>

      {filteredBooks.length === 0 ? <p className="summary">No hay libros que coincidan con tu búsqueda.</p> : null}

      <section className="books-grid" aria-label="Libros recomendados">
        {filteredBooks.map((book) => (
        <article key={book.id} className="book-card">
          <div className="book-cover">
            {book.image_url ? (
              <img src={book.image_url} alt={`Portada de ${book.title}`} loading="lazy" />
            ) : (
              <span>Sin imagen</span>
            )}
          </div>
          <div className="book-main">
            <div className="book-title-row">
              <h2>{book.title}</h2>
              {book.label ? <p className="book-label book-label-right">{book.label}</p> : null}
            </div>
            <p className="summary">{book.description}</p>
          </div>
          <div className="book-actions">
            <a className="book-link" href={book.book_url} target="_blank" rel="noopener noreferrer">
              Comprar
            </a>
          </div>
        </article>
        ))}
      </section>
    </>
  );
}
