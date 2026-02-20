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
  const likesCacheKey = useMemo(() => `product-digest-like-count:${slug}`, [slug]);
  const pendingSyncKey = useMemo(() => `product-digest-like-pending:${slug}`, [slug]);
  const [likes, setLikes] = useState<number>(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const syncPendingLike = async () => {
      const pending = window.localStorage.getItem(pendingSyncKey) === "1";
      if (!pending) return;

      try {
        const response = await fetch(`${apiBaseUrl}/api/likes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug })
        });

        if (!response.ok) return;

        const payload = (await response.json()) as { likes?: number };
        const serverLikes = typeof payload.likes === "number" ? payload.likes : 0;

        if (!cancelled) {
          setLikes((prev) => {
            const nextLikes = Math.max(prev, serverLikes);
            window.localStorage.setItem(likesCacheKey, String(nextLikes));
            return nextLikes;
          });
        }
        window.localStorage.removeItem(pendingSyncKey);
      } catch {
        // keep pending marker for next retry
      }
    };

    const load = async () => {
      setLoading(true);
      try {
        const wasLiked = window.localStorage.getItem(storageKey) === "1";
        const cachedLikes = Number(window.localStorage.getItem(likesCacheKey) || "0");

        if (!cancelled) {
          setLiked(wasLiked);
          setLikes(Number.isFinite(cachedLikes) ? cachedLikes : 0);
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
            const serverLikes = typeof payload.likes === "number" ? payload.likes : 0;
            setLikes((prev) => {
              const nextLikes = Math.max(prev, serverLikes);
              window.localStorage.setItem(likesCacheKey, String(nextLikes));
              return nextLikes;
            });
          }
        }
      } catch {}
      if (!cancelled) {
        setLoading(false);
      }

      await syncPendingLike();
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [likesCacheKey, pendingSyncKey, slug, storageKey]);

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
      window.localStorage.setItem(likesCacheKey, String(optimisticLikes));
      window.localStorage.setItem(pendingSyncKey, "1");

      const response = await fetch(`${apiBaseUrl}/api/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug })
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { likes?: number };
      const serverLikes = typeof payload.likes === "number" ? payload.likes : optimisticLikes;
      const nextLikes = Math.max(serverLikes, optimisticLikes);
      setLikes(nextLikes);
      window.localStorage.setItem(likesCacheKey, String(nextLikes));
      window.localStorage.removeItem(pendingSyncKey);
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
      <span className="like-count">{loading ? "Cargando..." : `${likes} me gusta`}</span>
    </div>
  );
}
