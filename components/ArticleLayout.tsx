import type { ReactNode } from "react";

import { ArticleNextAction } from "@/components/ArticleNextAction";
import { BackButton } from "@/components/BackButton";
import { LikeButton } from "@/components/LikeButton";
import { TagPill } from "@/components/TagPill";
import { TableOfContents } from "@/components/TableOfContents";
import type { Heading } from "@/lib/posts-api";
import { formatDate } from "@/lib/format";

export function ArticleLayout({
  title,
  slug,
  author,
  summary,
  coverImage,
  imageDescription,
  imageLink,
  date,
  updatedAt,
  readingTimeMinutes,
  tags,
  headings,
  children
}: {
  title: string;
  slug: string;
  author: string;
  summary: string;
  coverImage?: string;
  imageDescription?: string;
  imageLink?: string;
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
        <BackButton />
        <header className="article-header">
          <p className="meta-row">
            {readingTimeMinutes} {readingTimeMinutes === 1 ? "minuto" : "minutos"} de lectura
          </p>
          <h1>{title}</h1>
          <p className="summary">{summary}</p>
          {coverImage ? (
            <figure className="article-cover">
              {imageLink ? (
                <a href={imageLink} target="_blank" rel="noopener noreferrer">
                  <img src={coverImage} alt={imageDescription || title} loading="lazy" />
                </a>
              ) : (
                <img src={coverImage} alt={imageDescription || title} loading="lazy" />
              )}
              {imageDescription || imageLink ? (
                <figcaption>
                  {imageDescription ? <span>{imageDescription}</span> : null}
                  {imageLink ? (
                    <>
                      {" "}
                      <a href={imageLink} target="_blank" rel="noopener noreferrer">
                        Ver fuente
                      </a>
                    </>
                  ) : null}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
          <LikeButton slug={slug} />
          <p className="updated-at">Creado por {author} el {formatDate(date)}</p>
          <div className="tag-row">
            {tags.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>
        </header>
        <section className="prose-content">{children}</section>
        <ArticleNextAction />
      </article>
      <TableOfContents headings={headings} />
    </div>
  );
}
