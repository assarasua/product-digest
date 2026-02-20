"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  COOKIE_CONSENT_EVENT,
  COOKIE_OPEN_SETTINGS_EVENT,
  readCookieConsent,
  writeCookieConsent
} from "@/lib/cookie-consent";

const panelStyle: CSSProperties = {
  position: "fixed",
  left: "50%",
  bottom: "16px",
  transform: "translateX(-50%)",
  width: "min(900px, calc(100% - 16px))",
  background: "#f8f5ec",
  border: "1px solid #ddd6c8",
  borderRadius: "14px",
  boxShadow: "0 14px 32px rgba(0,0,0,0.16)",
  zIndex: 80,
  padding: "14px"
};

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginTop: "10px"
};

const buttonBase: CSSProperties = {
  border: "1px solid #d3ccb9",
  borderRadius: "10px",
  padding: "8px 12px",
  fontSize: "14px",
  cursor: "pointer"
};

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const consent = readCookieConsent();
    setVisible(!consent);
    setAnalytics(Boolean(consent?.analytics));

    const open = () => {
      const latest = readCookieConsent();
      setAnalytics(Boolean(latest?.analytics));
      setVisible(true);
    };

    window.addEventListener(COOKIE_OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(COOKIE_OPEN_SETTINGS_EVENT, open);
  }, []);

  const manageButton = useMemo(
    () => (
      <button
        type="button"
        onClick={() => {
          window.dispatchEvent(new Event(COOKIE_OPEN_SETTINGS_EVENT));
        }}
        style={{
          position: "fixed",
          right: "16px",
          bottom: "16px",
          zIndex: 70,
          border: "1px solid #d3ccb9",
          borderRadius: "999px",
          background: "#f8f5ec",
          color: "#4f4b41",
          padding: "8px 12px",
          fontSize: "13px",
          cursor: "pointer"
        }}
      >
        Preferencias de cookies
      </button>
    ),
    []
  );

  const save = (nextAnalytics: boolean) => {
    writeCookieConsent(nextAnalytics);
    setAnalytics(nextAnalytics);
    setVisible(false);
  };

  if (!visible) {
    return manageButton;
  }

  return (
    <>
      <section style={panelStyle} aria-label="Banner de cookies">
        <h2 style={{ margin: 0, fontSize: "18px" }}>Configuración de cookies</h2>
        <p style={{ marginTop: "8px", color: "#575247", fontSize: "14px", lineHeight: 1.5 }}>
          Usamos cookies necesarias para que la web funcione. Las cookies de analítica solo se activan con tu
          consentimiento. Puedes aceptar, rechazar o personalizar en cualquier momento.
        </p>

        <div style={{ marginTop: "10px", display: "grid", gap: "6px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
            <input type="checkbox" checked disabled />
            Necesarias (siempre activas)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
            Analítica (Plausible / InfiniteWatch)
          </label>
        </div>

        <div style={rowStyle}>
          <button type="button" onClick={() => save(false)} style={buttonBase}>
            Rechazar no esenciales
          </button>
          <button type="button" onClick={() => save(analytics)} style={buttonBase}>
            Guardar preferencias
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            style={{ ...buttonBase, background: "#1f7a3f", borderColor: "#1f7a3f", color: "white" }}
          >
            Aceptar todas
          </button>
        </div>

        <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#716a5c" }}>
          Más información en la política de privacidad de Product Digest.
        </p>
      </section>
      {manageButton}
    </>
  );
}

export function ConsentPlausibleScript({ plausibleDomain }: { plausibleDomain?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => {
      setEnabled(Boolean(readCookieConsent()?.analytics));
    };
    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, []);

  if (!plausibleDomain || !enabled) {
    return null;
  }

  return <script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.outbound-links.js" />;
}
