"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { buildCurrentPath, NAV_CURRENT_PATH_KEY, NAV_PREVIOUS_PATH_KEY } from "@/lib/navigation-history";

export function NavigationTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const search = window.location.search.startsWith("?") ? window.location.search.slice(1) : window.location.search;
    const nextPath = buildCurrentPath(pathname, search);
    const currentPath = window.sessionStorage.getItem(NAV_CURRENT_PATH_KEY);

    if (!currentPath) {
      window.sessionStorage.setItem(NAV_CURRENT_PATH_KEY, nextPath);
      return;
    }

    if (currentPath !== nextPath) {
      window.sessionStorage.setItem(NAV_PREVIOUS_PATH_KEY, currentPath);
      window.sessionStorage.setItem(NAV_CURRENT_PATH_KEY, nextPath);
    }
  }, [pathname]);

  return null;
}
