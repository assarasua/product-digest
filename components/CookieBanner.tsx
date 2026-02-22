"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./CookieBanner.module.css";
import { readCookieConsent, type CookieConsent, writeCookieConsent } from "@/lib/cookie-consent";

function buildConsent(analytics: boolean, ads: boolean): CookieConsent {
  return {
    version: 1,
    necessary: true,
    analytics,
    ads,
    decidedAt: new Date().toISOString()
  };
}

export function CookieBanner() {
  const [ready, setReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [ads, setAds] = useState(false);

  useEffect(() => {
    const current = readCookieConsent();
    if (current) {
      setAnalytics(current.analytics);
      setAds(current.ads);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
    setReady(true);
  }, []);

  if (!ready || !showBanner) {
    return null;
  }

  const rejectAll = () => {
    writeCookieConsent(buildConsent(false, false));
    setShowBanner(false);
  };

  const acceptAll = () => {
    writeCookieConsent(buildConsent(true, true));
    setShowBanner(false);
  };

  const saveConfig = () => {
    writeCookieConsent(buildConsent(analytics, ads));
    setShowBanner(false);
  };

  return (
    <aside className={styles.wrap} aria-label="Gestión de cookies">
      <div className={styles.card}>
        <h2 className={styles.title}>Utilizamos cookies</h2>
        <p className={styles.desc}>
          Usamos cookies esenciales y, si lo permites, cookies de analítica y publicidad. Más info en{" "}
          <Link href="/cookies">Aviso de cookies</Link>.
        </p>

        {showConfig ? (
          <div className={styles.config}>
            <div className={styles.row}>
              <input type="checkbox" checked readOnly aria-label="Cookies esenciales" />
              <div>
                <label>Esenciales</label>
                <p>Necesarias para el funcionamiento del sitio.</p>
              </div>
            </div>
            <div className={styles.row}>
              <input
                type="checkbox"
                checked={ads}
                onChange={(event) => setAds(event.target.checked)}
                aria-label="Publicidad dirigida"
              />
              <div>
                <label>Publicidad dirigida</label>
                <p>Permiten personalizar anuncios y medir campañas.</p>
              </div>
            </div>
            <div className={styles.row}>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
                aria-label="Analíticas"
              />
              <div>
                <label>Analíticas</label>
                <p>Nos ayudan a mejorar la experiencia del sitio.</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={() => setShowConfig((prev) => !prev)}>
            {showConfig ? "Ocultar" : "Configuración"}
          </button>
          <button type="button" className={styles.btn} onClick={rejectAll}>
            Rechazar
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={showConfig ? saveConfig : acceptAll}>
            {showConfig ? "Aceptar las cookies" : "Aceptar"}
          </button>
        </div>
      </div>
    </aside>
  );
}

