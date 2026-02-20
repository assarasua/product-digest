"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { buildCurrentPath, NAV_CURRENT_PATH_KEY, NAV_PREVIOUS_PATH_KEY } from "@/lib/navigation-history";

export function NavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    if (typeof window === "undefined") return;

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
  }, [pathname, search]);

  return null;
}
