"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { InfiniteWatchProvider } from "@infinitewatch/next";
import { COOKIE_CONSENT_EVENT, readCookieConsent } from "@/lib/cookie-consent";

const orgId = process.env.NEXT_PUBLIC_INFINITEWATCH_ORG_ID || "698ee4257fd92064f9aac24c";

export function Providers({ children }: { children: ReactNode }) {
  const [canStartTracking, setCanStartTracking] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    if (document.readyState === "complete") {
      setCanStartTracking(true);
    } else {
      const onLoad = () => setCanStartTracking(true);
      window.addEventListener("load", onLoad, { once: true });
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  useEffect(() => {
    const sync = () => {
      const consent = readCookieConsent();
      setAnalyticsEnabled(Boolean(consent?.analytics));
    };
    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync as EventListener);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync as EventListener);
  }, []);

  if (!canStartTracking || !analyticsEnabled) {
    return <>{children}</>;
  }

  return (
    <InfiniteWatchProvider organizationId={orgId} defaultSamplingPercent={100} debug={false}>
      {children}
    </InfiniteWatchProvider>
  );
}
