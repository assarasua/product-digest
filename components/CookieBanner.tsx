"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./CookieBanner.module.css";
import { readCookieConsent, type CookieConsent, writeCookieConsent } from "@/lib/cookie-consent";

function createConsent(analytics: boolean): CookieConsent {
  return {
    version: 1,
    necessary: true,
    analytics,
    decidedAt: new Date().toISOString()
  };
}

export function CookieBanner() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const consent = readCookieConsent();
    if (consent) {
      setAnalytics(consent.analytics);
      setVisible(false);
    } else {
      setVisible(true);
    }
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  const rejectAll = () => {
    writeCookieConsent(createConsent(false));
    setVisible(false);
  };

  const acceptAll = () => {
    writeCookieConsent(createConsent(true));
    setVisible(false);
  };

  const savePreferences = () => {
    writeCookieConsent(createConsent(analytics));
    setVisible(false);
  };

  if (!visible) {
    return (
      <button
        type="button"
        className={styles.launcher}
        onClick={() => {
          setVisible(true);
          setShowPreferences(true);
        }}
      >
        Cookies
      </button>
    );
  }

  return (
    <aside className={styles.root} aria-label="Preferencias de cookies">
      <div className={styles.card}>
        <h2 className={styles.title}>Utilizamos cookies</h2>
        <p className={styles.description}>
          Usamos cookies esenciales y, si lo permites, analíticas para mejorar el sitio. Más detalles en{" "}
          <Link href="/cookies">Aviso de cookies</Link>.
        </p>

        {showPreferences ? (
          <div className={styles.preferences}>
            <div className={styles.option}>
              <input type="checkbox" checked readOnly aria-label="Esenciales" />
              <div>
                <label>Esenciales</label>
                <p>Necesarias para funciones básicas del sitio.</p>
              </div>
            </div>
            <div className={styles.option}>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
                aria-label="Analíticas"
              />
              <div>
                <label>Analíticas</label>
                <p>Nos ayudan a medir y mejorar la experiencia.</p>
              </div>
            </div>
        </div>
        ) : null}

        <div className={styles.actions}>
          <button type="button" className={styles.button} onClick={() => setShowPreferences((prev) => !prev)}>
            {showPreferences ? "Ocultar" : "Configuración"}
          </button>
          <button type="button" className={styles.button} onClick={rejectAll}>
            Rechazar
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={showPreferences ? savePreferences : acceptAll}
          >
            {showPreferences ? "Aceptar las cookies" : "Aceptar"}
          </button>
        </div>
      </div>
    </aside>
  );
}
