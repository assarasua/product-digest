import type { Metadata } from "next";

import { PostCard } from "@/components/PostCard";
import { getPostsByTagFromApi } from "@/lib/posts-api";
import { ogImageUrl } from "@/lib/seo";

export const revalidate = 60;

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
  const posts = await getPostsByTagFromApi(tag);

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
