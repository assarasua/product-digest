export type CookieConsent = {
  version: 1;
  necessary: true;
  analytics: boolean;
  ads: boolean;
  decidedAt: string;
};

export const COOKIE_CONSENT_KEY = "pd_cookie_consent_v1";
export const COOKIE_CONSENT_EVENT = "pd-consent-updated";
const COOKIE_NAME = "pd_cookie_consent";

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed.version !== 1) return null;
    return {
      version: 1,
      necessary: true,
      analytics: Boolean(parsed.analytics),
      ads: Boolean(parsed.ads),
      decidedAt: String(parsed.decidedAt || new Date().toISOString())
    };
  } catch {
    return null;
  }
}

export function writeCookieConsent(consent: CookieConsent): void {
  if (typeof window === "undefined") return;

  const payload: CookieConsent = {
    version: 1,
    necessary: true,
    analytics: Boolean(consent.analytics),
    ads: Boolean(consent.ads),
    decidedAt: consent.decidedAt || new Date().toISOString()
  };

  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(payload));
  window.document.cookie = `${COOKIE_NAME}=v1; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: payload }));
}

