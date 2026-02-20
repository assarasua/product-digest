"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { InfiniteWatchProvider, useInfiniteWatch } from "@infinitewatch/next";

const orgId = process.env.NEXT_PUBLIC_INFINITEWATCH_ORG_ID || "698ee4257fd92064f9aac24c";
const infiniteWatchSamplingPercent = 100;
const heartbeatIntervalMs = 30000;
const infiniteWatchDebug = true;

function SessionDebugLogger() {
  const pathname = usePathname();

  useEffect(() => {
    const prefix = "[InfiniteWatch]";
    console.log(`${prefix} route active`, {
      path: pathname,
      at: new Date().toISOString()
    });
  }, [pathname]);

  useEffect(() => {
    const prefix = "[InfiniteWatch]";
    const startedAt = new Date().toISOString();

    console.log(`${prefix} provider initialized`, {
      organizationId: orgId ?? "missing",
      samplingPercent: infiniteWatchSamplingPercent,
      path: window.location.pathname,
      startedAt
    });

    const onWindowLoad = () => {
      console.log(`${prefix} page loaded`, {
        path: window.location.pathname,
        at: new Date().toISOString()
      });
    };

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
    window.addEventListener("load", onWindowLoad);
    window.addEventListener("beforeunload", onBeforeUnload);

    // First heartbeat immediately so you can validate start without waiting 30s.
    console.log(`${prefix} heartbeat`, {
      path: window.location.pathname,
      visible: document.visibilityState === "visible",
      at: new Date().toISOString()
    });

    const heartbeatId = window.setInterval(() => {
      console.log(`${prefix} heartbeat`, {
        path: window.location.pathname,
        visible: document.visibilityState === "visible",
        at: new Date().toISOString()
      });
    }, heartbeatIntervalMs);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("load", onWindowLoad);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.clearInterval(heartbeatId);
      console.log(`${prefix} logger disposed`, { at: new Date().toISOString() });
    };
  }, []);

  return null;
}

function InfiniteWatchRuntimeDiagnostics() {
  const { getSessionInfo, isBlocked, flush } = useInfiniteWatch();

  useEffect(() => {
    const prefix = "[InfiniteWatch]";

    const logRuntime = (reason: string) => {
      const session = getSessionInfo();
      const blocked = isBlocked();

      const logger = blocked ? console.warn : console.log;
      logger(`${prefix} runtime`, {
        reason,
        blocked,
        session,
        at: new Date().toISOString()
      });
    };

    logRuntime("mounted");
    const initTimer = window.setTimeout(() => logRuntime("after-init"), 1500);
    const intervalId = window.setInterval(() => logRuntime("runtime-heartbeat"), heartbeatIntervalMs);

    const onVisibilityChange = () => logRuntime(`visibility:${document.visibilityState}`);
    const onBeforeUnload = () => {
      flush();
      logRuntime("beforeunload");
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.clearTimeout(initTimer);
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [flush, getSessionInfo, isBlocked]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <InfiniteWatchProvider
      organizationId={orgId}
      defaultSamplingPercent={infiniteWatchSamplingPercent}
      sessionHeartbeatInterval={heartbeatIntervalMs}
      debug={infiniteWatchDebug}
    >
      <SessionDebugLogger />
      <InfiniteWatchRuntimeDiagnostics />
      {children}
    </InfiniteWatchProvider>
  );
}
