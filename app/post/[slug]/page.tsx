import type { Metadata } from "next";
import Script from "next/script";
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
  const imageUrl = post.coverImage || undefined;

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
      url: postUrl,
      publishedTime: post.date,
      modifiedTime: post.updatedAt ?? post.date,
      tags: post.tags,
      siteName: "Product Digest",
      locale: "es_ES",
      images: imageUrl ? [{ url: imageUrl, alt: post.imageDescription || post.title }] : undefined
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: post.summary,
      images: imageUrl ? [imageUrl] : undefined
    },
    other: {
      "article:published_time": post.date,
      "article:modified_time": post.updatedAt ?? post.date,
      "article:author": "Product Digest",
      "article:section": post.tags[0] ?? "product-management"
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://productdigest.es";
  const postUrl = `${siteUrl}/post/${post.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.updatedAt ?? post.date,
    inLanguage: "es-ES",
    mainEntityOfPage: postUrl,
    url: postUrl,
    author: {
      "@type": "Organization",
      name: "Product Digest"
    },
    publisher: {
      "@type": "Organization",
      name: "Product Digest",
      url: siteUrl
    },
    keywords: post.tags.join(", ")
  };

  return (
    <div className="page-wrap">
      <Script id={`schema-post-${post.slug}`} type="application/ld+json">
        {JSON.stringify(articleSchema)}
      </Script>
      <ReadingProgress />
      <ArticleLayout
        title={post.title}
        slug={post.slug}
        summary={post.summary}
        coverImage={post.coverImage}
        imageDescription={post.imageDescription}
        imageLink={post.imageLink}
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
