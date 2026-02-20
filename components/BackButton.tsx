"use client";

import { useRouter } from "next/navigation";
import { buildCurrentPath, NAV_PREVIOUS_PATH_KEY } from "@/lib/navigation-history";

export function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (typeof window === "undefined") {
      router.push("/");
      return;
    }

    const currentPath = buildCurrentPath(window.location.pathname, window.location.search.slice(1));
    const previousPath = window.sessionStorage.getItem(NAV_PREVIOUS_PATH_KEY);

    // Navigate to the last in-app route captured by NavigationTracker.
    if (previousPath && previousPath !== currentPath) {
      router.push(previousPath);
      return;
    }

    // Fallback to same-origin referrer for direct entries.
    if (document.referrer.startsWith(window.location.origin)) {
      const referrerUrl = new URL(document.referrer);
      const referrerPath = `${referrerUrl.pathname}${referrerUrl.search}${referrerUrl.hash}`;
      if (referrerPath && referrerPath !== currentPath) {
        router.push(referrerPath);
        return;
      }
    }

    router.push("/");
  }

  return (
    <button type="button" className="back-button" onClick={handleBack}>
      ← Volver
    </button>
  );
}
