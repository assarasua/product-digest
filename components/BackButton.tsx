"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (typeof window === "undefined") {
      router.push("/");
      return;
    }

    const sameOriginReferrer = document.referrer.startsWith(window.location.origin);
    if (sameOriginReferrer) {
      const referrerUrl = new URL(document.referrer);
      const target = `${referrerUrl.pathname}${referrerUrl.search}${referrerUrl.hash}`;
      router.push(target || "/");
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <button type="button" className="back-button" onClick={handleBack}>
      ← Volver
    </button>
  );
}
