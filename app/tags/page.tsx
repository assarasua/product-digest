import type { Metadata } from "next";

import { TagPill } from "@/components/TagPill";
import { getAllTags } from "@/lib/content";

export const metadata: Metadata = {
  title: "Temas",
  description: "Explora los artículos por tema."
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="page-wrap slim">
      <h1>Temas</h1>
      <p className="page-intro">Navega por area de interes.</p>
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
