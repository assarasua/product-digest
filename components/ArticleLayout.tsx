import type { ReactNode } from "react";

import { TagPill } from "@/components/TagPill";
import { TableOfContents } from "@/components/TableOfContents";
import type { Heading } from "@/lib/content";
import { formatDate } from "@/lib/format";

export function ArticleLayout({
  title,
  summary,
  date,
  updatedAt,
  readingTimeMinutes,
  tags,
  headings,
  children
}: {
  title: string;
  summary: string;
  date: string;
  updatedAt?: string;
  readingTimeMinutes: number;
  tags: string[];
  headings: Heading[];
  children: ReactNode;
}) {
  return (
    <div className="article-shell">
      <article className="article-main">
        <header className="article-header">
          <p className="meta-row">
            {formatDate(date)} · {readingTimeMinutes} min de lectura
          </p>
          <h1>{title}</h1>
          <p className="summary">{summary}</p>
          {updatedAt ? <p className="updated-at">Actualizado el {formatDate(updatedAt)}</p> : null}
          <div className="tag-row">
            {tags.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>
        </header>
        <section className="prose-content">{children}</section>
      </article>
      <TableOfContents headings={headings} />
    </div>
  );
}
