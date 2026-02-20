export const COOKIE_CONSENT_STORAGE_KEY = "pd_cookie_consent_v1";
export const COOKIE_CONSENT_COOKIE_NAME = "pd_cookie_consent";
export const COOKIE_CONSENT_EVENT = "pd-consent-updated";
export const COOKIE_OPEN_SETTINGS_EVENT = "pd-open-cookie-settings";

export type CookieConsent = {
  version: 1;
  necessary: true;
  analytics: boolean;
  decidedAt: string;
};

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function cookieValue(name: string): string | null {
  if (!isBrowser()) return null;
  const all = document.cookie.split(";").map((v) => v.trim());
  const prefix = `${name}=`;
  const row = all.find((v) => v.startsWith(prefix));
  if (!row) return null;
  return row.slice(prefix.length);
}

export function readConsent(): CookieConsent | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as CookieConsent;
      if (parsed?.version === 1) return parsed;
    } catch {
      // ignore parse errors
    }
  }

  const cookie = cookieValue(COOKIE_CONSENT_COOKIE_NAME);
  if (!cookie) return null;
  const analytics = cookie === "analytics";

  return {
    version: 1,
    necessary: true,
    analytics,
    decidedAt: new Date().toISOString()
  };
}

export function writeConsent(consent: CookieConsent) {
  if (!isBrowser()) return;

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));

  const maxAge = 60 * 60 * 24 * 180;
  const value = consent.analytics ? "analytics" : "necessary";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;

  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

export function clearNonEssentialConsentArtifacts() {
  if (!isBrowser()) return;
  // If future analytics SDKs store additional keys/cookies, clean them here.
}
