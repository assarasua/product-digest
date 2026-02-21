import type { Book } from "@/lib/books-api";

export function BookCard({ book }: { book: Book }) {
  return (
    <article className="book-card">
      <div className="book-main">
        <h2>{book.title}</h2>
        <p className="summary">{book.description}</p>
      </div>
      <div className="book-actions">
        <a className="book-link" href={book.url} target="_blank" rel="noopener noreferrer">
          Comprar
        </a>
      </div>
    </article>
  );
}
