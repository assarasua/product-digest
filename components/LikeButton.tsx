"use client";

import { useEffect, useMemo, useState } from "react";

const apiBaseUrl = "https://api.productdigest.es";

type LikeButtonProps = {
  slug: string;
};

export function LikeButton({ slug }: LikeButtonProps) {
  const storageKey = useMemo(() => `product-digest-like:${slug}`, [slug]);
  const [likes, setLikes] = useState<number>(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const wasLiked = window.localStorage.getItem(storageKey) === "1";
        if (!cancelled) {
          setLiked(wasLiked);
        }

        const response = await fetch(`${apiBaseUrl}/api/likes?slug=${encodeURIComponent(slug)}`);
        if (!response.ok) {
          if (!cancelled) {
            setLoading(false);
          }
          return;
        }
        const payload = (await response.json()) as { likes?: number };
        if (!cancelled) {
          setLikes(typeof payload.likes === "number" ? payload.likes : 0);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLoading(false);
        }
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
      const response = await fetch(`${apiBaseUrl}/api/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug })
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { likes?: number };
      setLikes(typeof payload.likes === "number" ? payload.likes : likes + 1);
      setLiked(true);
      window.localStorage.setItem(storageKey, "1");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="like-row" aria-live="polite">
      <button
        type="button"
        className={`like-button${liked ? " is-liked" : ""}`}
        disabled={liked || submitting || loading}
        onClick={handleLike}
      >
        {liked ? "Te gusta" : submitting ? "Guardando..." : "Me gusta"}
      </button>
      <span className="like-count">
        {loading ? "Cargando..." : `${likes} ${likes === 1 ? "me gusta" : "me gustas"}`}
      </span>
    </div>
  );
}
