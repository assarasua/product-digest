import type { Metadata } from "next";

import { SearchClient } from "@/components/SearchClient";
import { ogImageUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Busca en todos los artículos del blog.",
  alternates: {
    canonical: "/search"
  },
  openGraph: {
    title: "Buscar | Product Digest",
    description: "Busca en todos los artículos del blog.",
    url: "/search",
    type: "website",
    images: [{ url: ogImageUrl("Buscar", "Encuentra artículos de producto rápidamente") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Buscar | Product Digest",
    description: "Busca en todos los artículos del blog.",
    images: [ogImageUrl("Buscar", "Encuentra artículos de producto rápidamente")]
  }
};

export default function SearchPage() {
  return (
    <div className="page-wrap slim">
      <h1>Buscar</h1>
      <SearchClient />
    </div>
  );
}
