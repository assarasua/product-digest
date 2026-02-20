import type { Metadata } from "next";

import { TagPill } from "@/components/TagPill";
import { getAllTagsFromApi } from "@/lib/posts-api";
import { ogImageUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Temas",
  description: "Explora los artículos por tema.",
  alternates: {
    canonical: "/tags"
  },
  openGraph: {
    title: "Temas | Product Digest",
    description: "Explora los artículos por tema.",
    url: "/tags",
    type: "website",
    images: [{ url: ogImageUrl("Temas", "Explora artículos por área de interés") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Temas | Product Digest",
    description: "Explora los artículos por tema.",
    images: [ogImageUrl("Temas", "Explora artículos por área de interés")]
  }
};

export default async function TagsPage() {
  const tags = await getAllTagsFromApi();

  return (
    <div className="page-wrap slim">
      <h1>Temas</h1>
      <p className="page-intro">Navega por área de interés.</p>
      <div className="tag-cloud">
        {tags.map(({ tag, count }) => (
          <div key={tag} className="tag-with-count">
            <TagPill tag={tag} />
            <span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
