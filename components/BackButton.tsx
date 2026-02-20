"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (typeof window === "undefined") {
      router.push("/");
      return;
    }

    const currentUrl = window.location.href;

    // Prefer browser history for real back navigation.
    if (window.history.length > 1) {
      window.history.back();
      window.setTimeout(() => {
        if (window.location.href === currentUrl) {
          router.push("/");
        }
      }, 250);
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
