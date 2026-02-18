import { notFound } from "next/navigation";

import { ArticleLayout } from "@/components/ArticleLayout";
import { ReadingProgress } from "@/components/ReadingProgress";
import { compilePost } from "@/lib/compile-post";
import { getAllPostSlugs, getPostBySlug } from "@/lib/content";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const content = await compilePost(post);

  return (
    <div className="page-wrap">
      <ReadingProgress />
      <ArticleLayout
        title={post.title}
        summary={post.summary}
        date={post.date}
        updatedAt={post.updatedAt}
        readingTimeMinutes={post.readingTimeMinutes}
        tags={post.tags}
        headings={post.headings}
      >
        {content}
      </ArticleLayout>
    </div>
  );
}
