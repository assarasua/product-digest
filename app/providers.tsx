"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { InfiniteWatchProvider } from "@infinitewatch/next";

const orgId = process.env.NEXT_PUBLIC_INFINITEWATCH_ORG_ID || "698ee4257fd92064f9aac24c";

export function Providers({ children }: { children: ReactNode }) {
  const [canStartTracking, setCanStartTracking] = useState(false);

  useEffect(() => {
    if (document.readyState === "complete") {
      setCanStartTracking(true);
      return;
    }

    const onLoad = () => setCanStartTracking(true);
    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  if (!canStartTracking) {
    return <>{children}</>;
  }

  return (
    <InfiniteWatchProvider organizationId={orgId} defaultSamplingPercent={100} debug={false}>
      {children}
    </InfiniteWatchProvider>
  );
}
