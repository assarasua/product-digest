"use client";

import { useEffect, useState } from "react";

import {
  COOKIE_SETTINGS_EVENT,
  type CookieConsent,
  openCookieSettings,
  readCookieConsent,
  writeCookieConsent
} from "@/lib/cookie-consent";

function buildConsent(analytics: boolean): CookieConsent {
  return {
    version: 1,
    necessary: true,
    analytics,
    decidedAt: new Date().toISOString()
  };
}

export function CookieConsentBanner() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const current = readCookieConsent();
    setConsent(current);
    setAnalyticsEnabled(Boolean(current?.analytics));
    setShowPanel(!current);

    const openSettingsHandler = () => {
      const latest = readCookieConsent();
      setConsent(latest);
      setAnalyticsEnabled(Boolean(latest?.analytics));
      setShowPanel(true);
    };

    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettingsHandler);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettingsHandler);
  }, []);

  const saveChoice = (analytics: boolean) => {
    const next = buildConsent(analytics);
    writeCookieConsent(next);
    setConsent(next);
    setAnalyticsEnabled(analytics);
    setShowPanel(false);
  };

  if (!showPanel) {
    return (
      <button type="button" className="cookie-manage-button" onClick={() => openCookieSettings()}>
        Preferencias de cookies
      </button>
    );
  }

  return (
    <section className="cookie-banner" aria-label="Consentimiento de cookies">
      <h2>Tu privacidad importa</h2>
      <p>
        Utilizamos cookies necesarias para el funcionamiento del sitio y, solo con tu consentimiento, cookies de
        analitica para entender el uso y mejorar Product Digest.
      </p>

      <div className="cookie-category">
        <label>
          <input type="checkbox" checked disabled />
          Cookies necesarias (siempre activas)
        </label>
        <label>
          <input
            type="checkbox"
            checked={analyticsEnabled}
            onChange={(event) => setAnalyticsEnabled(event.target.checked)}
          />
          Cookies de analitica
        </label>
      </div>

      <div className="cookie-actions">
        <button type="button" className="cookie-btn secondary" onClick={() => saveChoice(false)}>
          Rechazar no esenciales
        </button>
        <button type="button" className="cookie-btn secondary" onClick={() => saveChoice(analyticsEnabled)}>
          Guardar preferencias
        </button>
        <button type="button" className="cookie-btn primary" onClick={() => saveChoice(true)}>
          Aceptar todas
        </button>
      </div>

      {consent ? <p className="cookie-note">Puedes cambiar tu decisión en cualquier momento.</p> : null}
    </section>
  );
}
