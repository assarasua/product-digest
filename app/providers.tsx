"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { InfiniteWatchProvider } from "@infinitewatch/next";
import { COOKIE_CONSENT_UPDATED_EVENT, readCookieConsent } from "@/lib/cookie-consent";

const orgId = process.env.NEXT_PUBLIC_INFINITEWATCH_ORG_ID || "698ee4257fd92064f9aac24c";

type ProvidersProps = {
  children: ReactNode;
  cookieBannerEnabled?: boolean;
};

export function Providers({ children, cookieBannerEnabled = false }: ProvidersProps) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    if (!cookieBannerEnabled) {
      setAnalyticsEnabled(true);
      return;
    }

    const sync = () => {
      const consent = readCookieConsent();
      setAnalyticsEnabled(Boolean(consent?.analytics));
    };

    sync();
    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, sync as EventListener);
    return () => window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, sync as EventListener);
  }, [cookieBannerEnabled]);

  if (!analyticsEnabled) {
    return <>{children}</>;
  }

  return (
    <InfiniteWatchProvider organizationId={orgId} defaultSamplingPercent={100} debug={false}>
      {children}
    </InfiniteWatchProvider>
  );
}
