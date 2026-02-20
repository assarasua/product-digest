export const COOKIE_CONSENT_KEY = "pd_cookie_consent_v1";
export const COOKIE_CONSENT_EVENT = "pd-cookie-consent-updated";
export const COOKIE_OPEN_SETTINGS_EVENT = "pd-cookie-open-settings";

export type CookieConsent = {
  version: 1;
  necessary: true;
  analytics: boolean;
  decidedAt: string;
};

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

export function writeCookieConsent(analytics: boolean): CookieConsent {
  const consent: CookieConsent = {
    version: 1,
    necessary: true,
    analytics,
    decidedAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
  }

  return consent;
}
