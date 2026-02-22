"use client";

import type { ReactNode } from "react";
import { InfiniteWatchProvider } from "@infinitewatch/next";

const orgId = process.env.NEXT_PUBLIC_INFINITEWATCH_ORG_ID || "698ee4257fd92064f9aac24c";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <InfiniteWatchProvider organizationId={orgId} defaultSamplingPercent={100} debug={false}>
      {children}
    </InfiniteWatchProvider>
  );
}
