"use client";

import type { ReactNode } from "react";

import { InfiniteWatchProvider } from "@infinitewatch/next";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <InfiniteWatchProvider organizationId={process.env.NEXT_PUBLIC_INFINITEWATCH_ORG_ID!}>
      {children}
    </InfiniteWatchProvider>
  );
}
