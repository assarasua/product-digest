"use client";

import { useEffect, useState } from "react";

type Book = {
  id: number;
  title: string;
  description: string;
  book_url: string;
};

function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_POSTS_API_BASE_URL ||
    "https://api.productdigest.es"
  ).replace(/\/+$/, "");
}

export function BooksClient() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <p className="summary">Cargando libros...</p>;
  }

  if (books.length === 0) {
    return <p className="summary">No hay libros disponibles ahora.</p>;
  }

  return (
    <section className="books-grid" aria-label="Libros recomendados">
      {books.map((book) => (
        <article key={book.id} className="book-card">
          <div className="book-main">
            <h2>{book.title}</h2>
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
  );
}
