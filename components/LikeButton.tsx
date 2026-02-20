"use client";

import { useEffect, useMemo, useState } from "react";

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_POSTS_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.productdigest.es"
).replace(/\/+$/, "");

type LikeButtonProps = {
  slug: string;
};

export function LikeButton({ slug }: LikeButtonProps) {
  const storageKey = useMemo(() => `product-digest-like:${slug}`, [slug]);
  const [likes, setLikes] = useState<number>(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const wasLiked = window.localStorage.getItem(storageKey) === "1";
        if (!cancelled) {
          setLiked(wasLiked);
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 8000);
        const response = await fetch(`${apiBaseUrl}/api/likes?slug=${encodeURIComponent(slug)}`, {
          signal: controller.signal
        });
        window.clearTimeout(timeout);
        if (response.ok) {
          const payload = (await response.json()) as { likes?: number };
          if (!cancelled) {
            setLikes(typeof payload.likes === "number" ? payload.likes : 0);
          }
        }
      } catch {}
      if (!cancelled) {
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, storageKey]);

  async function handleLike() {
    if (liked || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      const optimisticLikes = likes + 1;
      setLikes(optimisticLikes);
      setLiked(true);
      window.localStorage.setItem(storageKey, "1");

      const response = await fetch(`${apiBaseUrl}/api/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug })
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { likes?: number };
      setLikes(typeof payload.likes === "number" ? payload.likes : optimisticLikes);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="like-row" aria-live="polite">
      <button
        type="button"
        className={`like-button like-icon${liked ? " is-liked" : ""}`}
        disabled={liked || submitting}
        onClick={handleLike}
        aria-label={liked ? "Ya te gusta este artículo" : "Dar me gusta a este artículo"}
        title={liked ? "Ya te gusta" : "Me gusta"}
      >
        <span aria-hidden="true">{liked ? "❤" : "♡"}</span>
      </button>
      <span className="like-count">
        {loading ? "Cargando..." : `${likes} ${likes === 1 ? "me gusta" : "me gustas"}`}
      </span>
    </div>
  );
}
