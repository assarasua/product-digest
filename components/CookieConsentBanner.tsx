"use client";

import { useEffect, useState } from "react";

import styles from "@/components/CookieConsentBanner.module.css";
import {
  COOKIE_OPEN_SETTINGS_EVENT,
  type CookieConsent,
  clearNonEssentialConsentArtifacts,
  readConsent,
  writeConsent
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
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const current = readConsent();
    setAnalytics(Boolean(current?.analytics));
    setOpen(!current);

    const openSettings = () => {
      const latest = readConsent();
      setAnalytics(Boolean(latest?.analytics));
      setOpen(true);
    };

    window.addEventListener(COOKIE_OPEN_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(COOKIE_OPEN_SETTINGS_EVENT, openSettings);
  }, []);

  const persist = (nextAnalytics: boolean) => {
    const consent = buildConsent(nextAnalytics);
    writeConsent(consent);
    if (!nextAnalytics) {
      clearNonEssentialConsentArtifacts();
    }
    setAnalytics(nextAnalytics);
    setOpen(false);
  };

  return (
    <>
      {open ? (
        <div className={styles.wrapper} role="dialog" aria-label="Preferencias de cookies" aria-modal="false">
          <section className={styles.panel}>
            <h2 className={styles.title}>Tu privacidad importa</h2>
            <p className={styles.description}>
              Usamos cookies necesarias para el funcionamiento del sitio y cookies de analítica solo con tu
              consentimiento. Puedes aceptar, rechazar o personalizar en cualquier momento.
            </p>

            <div className={styles.categories}>
              <label className={styles.categoryLabel}>
                <input type="checkbox" checked disabled />
                Cookies necesarias (siempre activas)
              </label>
              <label className={styles.categoryLabel}>
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
                Cookies de analítica
              </label>
            </div>

            <div className={styles.actions}>
              <button className={styles.btn} type="button" onClick={() => persist(false)}>
                Rechazar no esenciales
              </button>
              <button className={styles.btn} type="button" onClick={() => persist(analytics)}>
                Guardar preferencias
              </button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} type="button" onClick={() => persist(true)}>
                Aceptar analítica
              </button>
            </div>

            <p className={styles.note}>
              Consulta la{" "}
              <a href="/privacy" style={{ color: "inherit", textDecoration: "underline" }}>
                política de privacidad
              </a>{" "}
              para más información.
            </p>
          </section>
        </div>
      ) : null}

      <button
        type="button"
        className={styles.manageButton}
        onClick={() => window.dispatchEvent(new Event(COOKIE_OPEN_SETTINGS_EVENT))}
      >
        Preferencias de cookies
      </button>
    </>
  );
}
