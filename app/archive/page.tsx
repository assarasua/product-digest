import type { Metadata } from "next";
import { Suspense } from "react";

import { ArchiveFilterList } from "@/components/ArchiveFilterList";
import { getAllPostsFromApi } from "@/lib/posts-api";
import { ogImageUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artículos",
  description: "Explora artículos por mes y filtra por tema o contenido.",
  alternates: {
    canonical: "/archive"
  },
  openGraph: {
    title: "Artículos | Product Digest",
    description: "Explora artículos por mes y filtra por tema o contenido.",
    url: "/archive",
    type: "website",
    images: [{ url: ogImageUrl("Archivo", "Navega por meses y publicaciones") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Artículos | Product Digest",
    description: "Explora artículos por mes y filtra por tema o contenido.",
    images: [ogImageUrl("Archivo", "Navega por meses y publicaciones")]
  }
};

export default async function ArchivePage() {
  const posts = await getAllPostsFromApi();

  return (
    <div className="page-wrap slim">
      <section className="hero">
        <p className="eyebrow">Artículos</p>
        <h1>Archivo completo de Product Digest.</h1>
        <p>Filtra por tema o por palabra clave para encontrar contenido relevante en segundos.</p>
      </section>
      <Suspense fallback={<p className="search-meta">Cargando artículos...</p>}>
        <ArchiveFilterList posts={posts} />
      </Suspense>
    </div>
  );
}
