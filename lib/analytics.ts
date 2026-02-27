export type NewsletterSource = "global" | "home-hero" | "article-inline";

export type AnalyticsEvent =
  | { type: "nav_menu_open" }
  | { type: "newsletter_submit_start"; source: NewsletterSource }
  | {
      type: "newsletter_submit_success";
      source: NewsletterSource;
      outcome: "created" | "duplicate";
    }
  | { type: "newsletter_submit_error"; source: NewsletterSource; reason: "network" | "api" | "unknown" }
  | { type: "cta_article_inline_click" };

type AmplitudeApi = {
  track?: (eventName: string, eventProperties?: Record<string, unknown>) => unknown;
  logEvent?: (eventName: string, eventProperties?: Record<string, unknown>) => unknown;
};

function getAmplitudeTrack(): ((eventName: string, eventProperties?: Record<string, unknown>) => unknown) | null {
  if (typeof window === "undefined") {
    return null;
  }

  const amplitude = (window as Window & { amplitude?: AmplitudeApi }).amplitude;
  if (!amplitude) {
    return null;
  }

  if (typeof amplitude.track === "function") {
    return amplitude.track.bind(amplitude);
  }

  if (typeof amplitude.logEvent === "function") {
    return amplitude.logEvent.bind(amplitude);
  }

  return null;
}

export function trackAnalyticsEvent(event: AnalyticsEvent): void {
  const track = getAmplitudeTrack();
  if (!track) {
    return;
  }

  try {
    const { type, ...properties } = event;
    track(type, properties);
  } catch {
    // Trackers must never block user flows.
  }
}
