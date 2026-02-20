import type { Metadata } from "next";

import { PostCard } from "@/components/PostCard";
import { getPostsByTagRuntime } from "@/lib/content";
import { ogImageUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const title = `Tema: ${tag} | Product Digest`;
  const description = `Artículos de Product Digest sobre ${tag}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/tag/${encodeURIComponent(tag)}`
    },
    openGraph: {
      title,
      description,
      url: `/tag/${encodeURIComponent(tag)}`,
      type: "website",
      images: [{ url: ogImageUrl(`Tema: ${tag}`, "Colección de artículos relacionados") }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl(`Tema: ${tag}`, "Colección de artículos relacionados")]
    }
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const posts = await getPostsByTagRuntime(tag);

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
