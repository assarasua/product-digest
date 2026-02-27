"use client";

import Link from "next/link";

import { trackAnalyticsEvent } from "@/lib/analytics";

export function ArticleNextAction() {
  return (
    <section className="article-next-action" aria-label="Siguiente paso recomendado">
      <h2>Siguiente paso</h2>
      <p className="summary">
        Si este artículo te resultó útil, explora más contenido práctico para mejorar estrategia y ejecución de
        producto.
      </p>
      <div className="article-next-actions">
        <Link
          href="/archive"
          className="about-link-button"
          onClick={() => trackAnalyticsEvent({ type: "cta_article_inline_click" })}
        >
          Explorar más artículos
        </Link>
        <Link href="/product-builders" className="pagination-link">
          Leer Human Insights
        </Link>
      </div>
    </section>
  );
}
