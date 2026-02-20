"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { InfiniteWatchProvider } from "@infinitewatch/next";

const orgId = process.env.NEXT_PUBLIC_INFINITEWATCH_ORG_ID || "698ee4257fd92064f9aac24c";
const infiniteWatchSamplingPercent = 100;

function SessionDebugLogger() {
  useEffect(() => {
    const prefix = "[InfiniteWatch]";
    const startedAt = new Date().toISOString();

    console.log(`${prefix} provider initialized`, {
      organizationId: orgId ?? "missing",
      samplingPercent: infiniteWatchSamplingPercent,
      path: window.location.pathname,
      startedAt
    });

    const onVisibilityChange = () => {
      console.log(`${prefix} visibility`, {
        state: document.visibilityState,
        at: new Date().toISOString()
      });
    };

    const onBeforeUnload = () => {
      console.log(`${prefix} session closing`, {
        path: window.location.pathname,
        at: new Date().toISOString()
      });
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    const heartbeatId = window.setInterval(() => {
      console.log(`${prefix} heartbeat`, {
        path: window.location.pathname,
        visible: document.visibilityState === "visible",
        at: new Date().toISOString()
      });
    }, 30000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.clearInterval(heartbeatId);
      console.log(`${prefix} logger disposed`, { at: new Date().toISOString() });
    };
  }, []);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <InfiniteWatchProvider organizationId={orgId} defaultSamplingPercent={infiniteWatchSamplingPercent}>
      <SessionDebugLogger />
      {children}
    </InfiniteWatchProvider>
  );
}
