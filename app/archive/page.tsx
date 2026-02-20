import type { Metadata } from "next";
import Link from "next/link";

import { getArchiveFromApi } from "@/lib/posts-api";
import { formatDate, formatMonth } from "@/lib/format";
import { ogImageUrl } from "@/lib/seo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Archivo",
  description: "Explora artículos por mes.",
  alternates: {
    canonical: "/archive"
  },
  openGraph: {
    title: "Archivo | Product Digest",
    description: "Explora artículos por mes.",
    url: "/archive",
    type: "website",
    images: [{ url: ogImageUrl("Archivo", "Navega por meses y publicaciones") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Archivo | Product Digest",
    description: "Explora artículos por mes.",
    images: [ogImageUrl("Archivo", "Navega por meses y publicaciones")]
  }
};

export default async function ArchivePage() {
  const archive = await getArchiveFromApi();

  return (
    <div className="page-wrap slim">
      <h1>Archivo</h1>
      <div className="archive-list">
        {archive.map(({ month, posts }) => (
          <section key={month} className="archive-month">
            <h2>{formatMonth(month)}</h2>
            <ul>
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/post/${post.slug}`}>{post.title}</Link>
                  <span>{formatDate(post.date)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
