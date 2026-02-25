export type CookieConsent = {
  version: 1;
  necessary: true;
  analytics: boolean;
  decidedAt: string;
};

const CONSENT_STORAGE_KEY = "pd_cookie_consent_v1";
const CONSENT_COOKIE_KEY = "pd_cookie_consent";
const CONSENT_EVENT = "pd-consent-updated";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function isValidConsent(value: unknown): value is CookieConsent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CookieConsent>;
  return (
    candidate.version === 1 &&
    candidate.necessary === true &&
    typeof candidate.analytics === "boolean" &&
    typeof candidate.decidedAt === "string" &&
    candidate.decidedAt.length > 0
  );
}

function readCookieValue(name: string): string | undefined {
  if (!isBrowser()) return undefined;
  const parts = document.cookie.split(";").map((item) => item.trim());
  const match = parts.find((item) => item.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

function writeConsentCookie(consent: CookieConsent) {
  if (!isBrowser()) return;
  const value = consent.analytics ? "v1:a1" : "v1:a0";
  document.cookie = `${CONSENT_COOKIE_KEY}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
}

function consentFromCookie(value: string | undefined): CookieConsent | null {
  if (!value) return null;
  if (value !== "v1:a1" && value !== "v1:a0") return null;
  return {
    version: 1,
    necessary: true,
    analytics: value === "v1:a1",
    decidedAt: new Date().toISOString()
  };
}

export function readCookieConsent(): CookieConsent | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidConsent(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore malformed localStorage payload.
  }

  return consentFromCookie(readCookieValue(CONSENT_COOKIE_KEY));
}

export function writeCookieConsent(consent: CookieConsent): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Ignore localStorage write failures.
  }

  writeConsentCookie(consent);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
}

export function hasConsentDecision(): boolean {
  return readCookieConsent() !== null;
}

export function isAnalyticsAllowed(): boolean {
  const consent = readCookieConsent();
  return Boolean(consent?.analytics);
}

export const consentStorageKey = CONSENT_STORAGE_KEY;
export const consentCookieKey = CONSENT_COOKIE_KEY;
export const consentUpdatedEvent = CONSENT_EVENT;
