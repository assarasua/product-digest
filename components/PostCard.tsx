"use client";

import Link from "next/link";

import { TagPill } from "@/components/TagPill";
import type { Post } from "@/lib/content";
import { formatDate } from "@/lib/format";

export function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <article className="post-card" style={{ animationDelay: `${Math.min(index * 60, 320)}ms` }}>
      <p className="meta-row">
        {formatDate(post.date)} · {post.readingTimeMinutes} min de lectura
      </p>
      <h2>
        <Link href={`/post/${post.slug}`}>{post.title}</Link>
      </h2>
      <p className="summary">{post.previewText}</p>
      <div className="tag-row">
        {post.tags.map((tag) => (
          <TagPill key={`${post.slug}-${tag}`} tag={tag} />
        ))}
      </div>
    </article>
  );
}
