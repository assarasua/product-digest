import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleLayout } from "@/components/ArticleLayout";
import { ReadingProgress } from "@/components/ReadingProgress";
import { compilePost } from "@/lib/compile-post";
import { getAllPostSlugs, getPostBySlug } from "@/lib/content";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Artículo no encontrado"
    };
  }

  const postUrl = `/post/${post.slug}`;

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: postUrl
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      url: postUrl
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary
    }
  };
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
        slug={post.slug}
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
