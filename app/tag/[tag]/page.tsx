import type { Metadata } from "next";

import { PostCard } from "@/components/PostCard";
import { getAllTags, getPostsByTag } from "@/lib/content";

export const runtime = "edge";

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `Tema: ${tag}`,
    description: `Articulos etiquetados como ${tag}.`
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);

  return (
    <div className="page-wrap">
      <h1>Tema: {tag}</h1>
      <p className="page-intro">{posts.length} articulo(s)</p>
      <section className="feed-grid">
        {posts.map((post, index) => (
          <PostCard key={post.slug} post={post} index={index} />
        ))}
      </section>
    </div>
  );
}
