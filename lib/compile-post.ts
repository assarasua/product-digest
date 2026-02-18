import { Fragment, createElement, type ReactNode } from "react";

import type { Post } from "@/lib/content";

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  function renderBoldSegments(value: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let segmentStart = 0;
    let boldMatch: RegExpExecArray | null;

    while ((boldMatch = boldRegex.exec(value)) !== null) {
      if (boldMatch.index > segmentStart) {
        nodes.push(value.slice(segmentStart, boldMatch.index));
      }
      nodes.push(createElement("strong", { key: `strong-${key++}` }, boldMatch[1]));
      segmentStart = boldMatch.index + boldMatch[0].length;
    }

    if (segmentStart < value.length) {
      nodes.push(value.slice(segmentStart));
    }

    return nodes;
  }

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...renderBoldSegments(text.slice(lastIndex, match.index)));
    }
    parts.push(
      createElement(
        "a",
        { key: `link-${key++}`, href: match[2], target: "_blank", rel: "noreferrer" },
        renderBoldSegments(match[1])
      )
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(...renderBoldSegments(text.slice(lastIndex)));
  }

  return parts;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function compilePost(post: Post): Promise<ReactNode> {
  if (process.env.CONTENT_DEBUG === "1") {
    const key = "__compile_post_count__";
    const store = globalThis as unknown as Record<string, number | undefined>;
    const current = (store[key] ?? 0) + 1;
    store[key] = current;
    console.log(`[compile-post] calls=${current} slug=${post.slug}`);
  }

  const lines = post.body.split("\n");
  const blocks: ReactNode[] = [];
  let listBuffer: string[] = [];
  let ordered = false;
  let key = 0;

  const flushList = () => {
    if (listBuffer.length === 0) {
      return;
    }
    const items = listBuffer.map((item, idx) => createElement("li", { key: `${key}-${idx}` }, renderInline(item)));
    blocks.push(createElement(ordered ? "ol" : "ul", { key: `${ordered ? "ol" : "ul"}-${key}` }, items));
    key += 1;
    listBuffer = [];
    ordered = false;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      flushList();
      blocks.push(createElement("h2", { key: `h2-${key}`, id: slugify(h2[1]) }, h2[1]));
      key += 1;
      continue;
    }

    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      flushList();
      blocks.push(createElement("h3", { key: `h3-${key}`, id: slugify(h3[1]) }, h3[1]));
      key += 1;
      continue;
    }

    const ul = line.match(/^-\s+(.+)$/);
    if (ul) {
      if (listBuffer.length === 0) {
        ordered = false;
      } else if (ordered) {
        flushList();
      }
      listBuffer.push(ul[1]);
      continue;
    }

    const ol = line.match(/^\d+\.\s+(.+)$/);
    if (ol) {
      if (listBuffer.length === 0) {
        ordered = true;
      } else if (!ordered) {
        flushList();
      }
      listBuffer.push(ol[1]);
      continue;
    }

    flushList();

    if (line.startsWith(">")) {
      blocks.push(createElement("blockquote", { key: `bq-${key}` }, renderInline(line.slice(1).trim())));
      key += 1;
      continue;
    }

    blocks.push(createElement("p", { key: `p-${key}` }, renderInline(line)));
    key += 1;
  }

  flushList();

  return createElement(Fragment, null, blocks);
}
