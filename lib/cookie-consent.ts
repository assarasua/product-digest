export type CookieConsent = {
  version: 1;
  necessary: true;
  analytics: boolean;
  decidedAt: string;
};

export const COOKIE_CONSENT_STORAGE_KEY = "pd_cookie_consent_v1";
export const COOKIE_CONSENT_COOKIE_NAME = "pd_cookie_consent";
export const COOKIE_CONSENT_UPDATED_EVENT = "pd-consent-updated";

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (parsed.version !== 1) return null;

    return {
      version: 1,
      necessary: true,
      analytics: Boolean(parsed.analytics),
      decidedAt: String(parsed.decidedAt || new Date().toISOString())
    };
  } catch {
    return null;
  }
}

export function writeCookieConsent(consent: CookieConsent): void {
  if (typeof window === "undefined") return;

  const normalized: CookieConsent = {
    version: 1,
    necessary: true,
    analytics: Boolean(consent.analytics),
    decidedAt: consent.decidedAt || new Date().toISOString()
  };

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(normalized));
  window.document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=v1; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: normalized }));
}

