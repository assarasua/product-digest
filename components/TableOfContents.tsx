"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Heading } from "@/lib/content";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) {
    return null;
  }

  return (
    <aside className="toc-wrapper" aria-label="Tabla de contenidos">
      <details open>
        <summary>En este articulo</summary>
        <ul className="toc-list">
          {headings.map((heading) => (
            <li key={heading.id} data-level={heading.level}>
              <Link
                href={`#${heading.id}`}
                className={activeId === heading.id ? "is-active" : ""}
                aria-current={activeId === heading.id ? "location" : undefined}
              >
                {heading.text}
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </aside>
  );
}
