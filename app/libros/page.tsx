import type { Metadata } from "next";

import { BooksClient } from "@/components/BooksClient";
import { ogImageUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Libros",
  description:
    "Selección de libros recomendados para Product Managers, Product Leaders y Product Builders.",
  alternates: {
    canonical: "/libros"
  },
  openGraph: {
    title: "Libros | Product Digest",
    description:
      "Selección de libros recomendados para Product Managers, Product Leaders y Product Builders.",
    url: "/libros",
    type: "website",
    images: [{ url: ogImageUrl("Libros", "Lecturas para mejorar criterio y ejecución de producto") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Libros | Product Digest",
    description:
      "Selección de libros recomendados para Product Managers, Product Leaders y Product Builders.",
    images: [ogImageUrl("Libros", "Lecturas para mejorar criterio y ejecución de producto")]
  }
};

export default function BooksPage() {
  return (
    <div className="page-wrap">
      <h1>Libros</h1>
      <p className="page-intro">
        El lugar donde Product Managers, Product Leaders y Product Builders encuentran lecturas de alto impacto para
        mejorar decisiones, estrategia y ejecución.
      </p>
      <BooksClient />
    </div>
  );
}
