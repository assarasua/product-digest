import type { Metadata } from "next";

import { SearchClient } from "@/components/SearchClient";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Busca en todos los artículos del blog.",
  alternates: {
    canonical: "/search"
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
