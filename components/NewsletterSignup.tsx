"use client";

import { useState } from "react";

type NewsletterSignupProps = {
  title?: string;
  description?: string;
};

export function NewsletterSignup({
  title = "Unete a la familia Product Digest",
  description = "Dejanos tu email y te enviaremos ideas aplicables para construir mejor producto."
}: NewsletterSignupProps) {
  const rawSubscribeUrl = process.env.NEXT_PUBLIC_NEWSLETTER_SUBSCRIBE_API_URL;
  const subscribeUrl = normalizeSubscribeUrl(rawSubscribeUrl);
  const isConfigured = Boolean(subscribeUrl);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "duplicate" | "not_configured" | "cors_error"
  >("idle");

  return (
    <section className="newsletter-card" aria-label="Unete a Product Digest">
      <h2>{title}</h2>
      <p>{description}</p>

      <form
        className="newsletter-form"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!subscribeUrl) {
            setStatus("not_configured");
            return;
          }
          setStatus("loading");

          try {
            const response = await fetch(subscribeUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email })
            });

            if (response.ok) {
              setEmail("");
              setStatus("success");
              return;
            }

            const payload = (await response.json()) as { error?: string };
            if (payload.error === "duplicate") {
              setStatus("duplicate");
              return;
            }

            setStatus("error");
          } catch (error) {
            if (error instanceof TypeError) {
              setStatus("cors_error");
              return;
            }
            setStatus("error");
          }
        }}
      >
        <label htmlFor="newsletter-email" className="newsletter-label">
          Email
        </label>
        <div className="newsletter-row">
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@email.com"
            className="newsletter-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" className="newsletter-button" disabled={status === "loading"}>
            {status === "loading" ? "Enviando..." : "Unirme"}
          </button>
        </div>
      </form>

      {status === "success" ? <p className="newsletter-note">Gracias. Ya formas parte de Product Digest.</p> : null}
      {status === "duplicate" ? <p className="newsletter-note">Ese email ya esta registrado.</p> : null}
      {status === "error" ? <p className="newsletter-note">No se pudo guardar tu email. Intenta de nuevo.</p> : null}
      {status === "cors_error" ? (
        <p className="newsletter-note">
          El API de suscripcion esta bloqueando CORS para <code>https://productdigest.es</code>.
        </p>
      ) : null}
      {!isConfigured || status === "not_configured" ? (
        <p className="newsletter-note">
          Falta configurar <code>NEXT_PUBLIC_NEWSLETTER_SUBSCRIBE_API_URL</code> en el deploy (ejemplo:
          <code>https://api.productdigest.es/subscribers</code>).
        </p>
      ) : null}
    </section>
  );
}

function normalizeSubscribeUrl(rawValue: string | undefined): string | null {
  if (!rawValue) {
    return null;
  }

  const trimmed = rawValue.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProtocol);
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/api/subscribers";
    }
    return url.toString();
  } catch {
    return null;
  }
}
