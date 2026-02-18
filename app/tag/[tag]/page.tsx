import { PostCard } from "@/components/PostCard";
import { getAllTags, getPostsByTag } from "@/lib/content";

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
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
