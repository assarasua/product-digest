"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { InfiniteWatchProvider } from "@infinitewatch/next";
import { consentUpdatedEvent, readCookieConsent, type CookieConsent } from "@/lib/cookie-consent";

const orgId = process.env.NEXT_PUBLIC_INFINITEWATCH_ORG_ID || "698ee4257fd92064f9aac24c";
const amplitudeApiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || "c96abb5d544df4471ce868ea3849d764";
const amplitudeScriptSrc =
  process.env.NEXT_PUBLIC_AMPLITUDE_SCRIPT_SRC || `https://cdn.amplitude.com/script/${amplitudeApiKey}.js`;
const amplitudeReplaySamplePercent = Math.max(
  0,
  Math.min(100, Number(process.env.NEXT_PUBLIC_AMPLITUDE_REPLAY_SAMPLE_PERCENT || 100))
);

declare global {
  interface Window {
    amplitude?: {
      add?: (plugin: unknown) => void;
      init?: (key: string, options?: Record<string, unknown>) => void;
      setOptOut?: (value: boolean) => void;
      sessionReplay?: {
        plugin?: (options?: Record<string, unknown>) => unknown;
      };
    };
    __pdAmplitudeLoaded?: boolean;
    __pdAmplitudeLoading?: boolean;
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const [windowLoaded, setWindowLoaded] = useState(false);
  const [consentResolved, setConsentResolved] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const onLoad = () => setWindowLoaded(true);

    if (document.readyState === "complete") {
      onLoad();
      return;
    }

    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    const syncConsent = () => {
      const consent = readCookieConsent();
      setAnalyticsAllowed(Boolean(consent?.analytics));
      setConsentResolved(true);
    };

    const onConsentUpdated = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsent>).detail;
      if (detail && typeof detail.analytics === "boolean") {
        setAnalyticsAllowed(detail.analytics);
        setConsentResolved(true);
        return;
      }
      syncConsent();
    };

    syncConsent();
    window.addEventListener(consentUpdatedEvent, onConsentUpdated as EventListener);
    return () => window.removeEventListener(consentUpdatedEvent, onConsentUpdated as EventListener);
  }, []);

  useEffect(() => {
    if (!windowLoaded || !consentResolved) {
      return;
    }

    if (!analyticsAllowed) {
      window.amplitude?.setOptOut?.(true);
      const existingScript = document.getElementById("pd-amplitude-sdk");
      if (existingScript) {
        existingScript.remove();
      }
      window.__pdAmplitudeLoaded = false;
      window.__pdAmplitudeLoading = false;
      return;
    }

    if (!windowLoaded || !amplitudeApiKey || window.__pdAmplitudeLoaded || window.__pdAmplitudeLoading) {
      return;
    }

    const existingScript = document.getElementById("pd-amplitude-sdk");
    if (existingScript) {
      window.__pdAmplitudeLoading = true;
      return;
    }

    const script = document.createElement("script");
    script.id = "pd-amplitude-sdk";
    script.src = amplitudeScriptSrc;
    script.async = true;
    window.__pdAmplitudeLoading = true;

    script.onload = () => {
      try {
        const amplitude = window.amplitude;
        const plugin = amplitude?.sessionReplay?.plugin?.({ sampleRate: amplitudeReplaySamplePercent / 100 });
        if (plugin && amplitude?.add) {
          amplitude.add(plugin);
        }

        amplitude?.init?.(amplitudeApiKey, {
          fetchRemoteConfig: true,
          autocapture: {
            attribution: true,
            fileDownloads: true,
            formInteractions: true,
            pageViews: true,
            sessions: true,
            elementInteractions: true,
            networkTracking: true,
            webVitals: true,
            frustrationInteractions: {
              thrashedCursor: true,
              errorClicks: true,
              deadClicks: true,
              rageClicks: true
            }
          }
        });
        amplitude?.setOptOut?.(false);
        window.__pdAmplitudeLoaded = true;
        window.__pdAmplitudeLoading = false;
      } catch {
        // Avoid blocking render if analytics init fails.
        window.__pdAmplitudeLoading = false;
      }
    };

    script.onerror = () => {
      window.__pdAmplitudeLoading = false;
    };

    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [analyticsAllowed, consentResolved, windowLoaded]);

  if (!windowLoaded || !consentResolved || !analyticsAllowed) {
    return <>{children}</>;
  }

  return (
    <InfiniteWatchProvider organizationId={orgId} defaultSamplingPercent={100} debug={false}>
      {children}
    </InfiniteWatchProvider>
  );
}
