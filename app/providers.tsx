"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { InfiniteWatchProvider } from "@infinitewatch/next";

const orgId = process.env.NEXT_PUBLIC_INFINITEWATCH_ORG_ID || "698ee4257fd92064f9aac24c";
const amplitudeApiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || "c96abb5d544df4471ce868ea3849d764";
const amplitudeScriptSrc =
  process.env.NEXT_PUBLIC_AMPLITUDE_SCRIPT_SRC || `https://cdn.amplitude.com/script/${amplitudeApiKey}.js`;

declare global {
  interface Window {
    amplitude?: {
      add?: (plugin: unknown) => void;
      init?: (key: string, options?: Record<string, unknown>) => void;
      sessionReplay?: {
        plugin?: (options?: Record<string, unknown>) => unknown;
      };
    };
    __pdAmplitudeLoaded?: boolean;
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const [windowLoaded, setWindowLoaded] = useState(false);

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
    if (!windowLoaded || !amplitudeApiKey || window.__pdAmplitudeLoaded) {
      return;
    }

    const script = document.createElement("script");
    script.src = amplitudeScriptSrc;
    script.async = true;

    script.onload = () => {
      try {
        const amplitude = window.amplitude;
        const plugin = amplitude?.sessionReplay?.plugin?.({ sampleRate: 1 });
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
        window.__pdAmplitudeLoaded = true;
      } catch {
        // Avoid blocking render if analytics init fails.
      }
    };

    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [windowLoaded]);

  if (!windowLoaded) {
    return <>{children}</>;
  }

  return (
    <InfiniteWatchProvider organizationId={orgId} defaultSamplingPercent={100} debug={false}>
      {children}
    </InfiniteWatchProvider>
  );
}
