"use client";

import { useEffect, useState } from "react";

import { COOKIE_CONSENT_EVENT, readConsent } from "@/lib/cookie-consent";

export function ConsentPlausibleScript({ plausibleDomain }: { plausibleDomain?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(Boolean(readConsent()?.analytics));
    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, []);

  if (!plausibleDomain || !enabled) return null;

  return <script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.outbound-links.js" />;
}
