export const COOKIE_CONSENT_STORAGE_KEY = "pd_cookie_consent_v1";
export const COOKIE_CONSENT_COOKIE_NAME = "pd_cookie_consent";
export const COOKIE_CONSENT_EVENT = "pd-consent-updated";
export const COOKIE_SETTINGS_EVENT = "pd-open-cookie-settings";

export type CookieConsent = {
  version: 1;
  necessary: true;
  analytics: boolean;
  decidedAt: string;
};

function parseCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((item) => item.trim());
  const prefix = `${name}=`;
  const found = parts.find((item) => item.startsWith(prefix));
  if (!found) return null;
  return found.slice(prefix.length);
}

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  const fromStorage = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (fromStorage) {
    try {
      return JSON.parse(fromStorage) as CookieConsent;
    } catch {
      return null;
    }
  }

  const fromCookie = parseCookie(COOKIE_CONSENT_COOKIE_NAME);
  if (!fromCookie) return null;
  const analytics = fromCookie === "analytics";
  return {
    version: 1,
    necessary: true,
    analytics,
    decidedAt: new Date().toISOString()
  };
}

export function writeCookieConsent(consent: CookieConsent) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));

  const maxAgeSeconds = 60 * 60 * 24 * 180; // 180 days
  const value = consent.analytics ? "analytics" : "necessary";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;

  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

export function openCookieSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}
