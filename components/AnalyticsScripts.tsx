"use client";

import { useEffect, useState } from "react";

import { COOKIE_CONSENT_EVENT, readCookieConsent } from "@/lib/cookie-consent";

export function AnalyticsScripts({ plausibleDomain }: { plausibleDomain?: string }) {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const sync = () => {
      const consent = readCookieConsent();
      setAnalyticsAllowed(Boolean(consent?.analytics));
    };

    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, []);

  if (!plausibleDomain || !analyticsAllowed) {
    return null;
  }

  return <script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.outbound-links.js" />;
}
