import type { Metadata } from "next";
import Link from "next/link";

import { getAllPosts } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Wiki para Product Leaders",
  description: "Base práctica para líderes de producto: estrategia, decisiones, AI PM y ejecución.",
  alternates: {
    canonical: "/product-leaders-wiki"
  }
};

const leaderTags = new Set([
  "product-strategy",
  "decision-making",
  "go-to-market",
  "growth",
  "ai-pm",
  "pricing",
  "roadmap"
]);

export default function ProductLeadersWikiPage() {
  const posts = getAllPosts().filter((post) => post.tags.some((tag) => leaderTags.has(tag))).slice(0, 24);

  return (
    <div className="page-wrap slim">
      <h1>Wiki para Product Leaders</h1>
      <p className="page-intro">
        Colección curada para líderes de producto en etapa de crecimiento: marcos de estrategia, velocidad de decisión,
        pricing, GTM y AI PM.
      </p>

      <div className="archive-list">
        {posts.map((post) => (
          <article key={post.slug} className="archive-month">
            <h2>
              <Link href={`/post/${post.slug}`}>{post.title}</Link>
            </h2>
            <p>{post.summary}</p>
            <p>
              <small>{formatDate(post.date)}</small>
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
