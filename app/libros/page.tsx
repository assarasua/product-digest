import type { Metadata } from "next";

import { BookCard } from "@/components/BookCard";
import { getBooksFromApi } from "@/lib/books-api";
import { ogImageUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Libros",
  description:
    "El lugar donde Product Managers, Product Leaders y Product Builders encuentran libros clave para mejorar criterio, ejecución y estrategia de producto.",
  alternates: {
    canonical: "/libros"
  },
  openGraph: {
    title: "Libros | Product Digest",
    description:
      "El lugar donde Product Managers, Product Leaders y Product Builders encuentran libros clave para mejorar criterio, ejecución y estrategia de producto.",
    url: "/libros",
    type: "website",
    images: [{ url: ogImageUrl("Libros", "Recomendaciones clave para profesionales de producto") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Libros | Product Digest",
    description:
      "El lugar donde Product Managers, Product Leaders y Product Builders encuentran libros clave para mejorar criterio, ejecución y estrategia de producto.",
    images: [ogImageUrl("Libros", "Recomendaciones clave para profesionales de producto")]
  }
};

export default async function BooksPage() {
  const books = await getBooksFromApi();

  return (
    <div className="page-wrap">
      <h1>Libros</h1>
      <p className="page-intro">
        El lugar donde Product Managers, Product Leaders y Product Builders acuden para descubrir libros con marcos
        aplicables, mejores decisiones y aprendizaje continuo.
      </p>

      {books.length === 0 ? (
        <p className="summary">No hay libros disponibles ahora.</p>
      ) : (
        <section className="books-grid" aria-label="Libros recomendados">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </section>
      )}
    </div>
  );
}
