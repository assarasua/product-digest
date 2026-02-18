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
  const subscribeUrl = "https://api.productdigest.es/api/subscribers";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  return (
    <section className="newsletter-card" aria-label="Unete a Product Digest">
      <h2>{title}</h2>
      <p>{description}</p>

      <form
        className="newsletter-form"
        onSubmit={async (event) => {
          event.preventDefault();
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
          } catch {
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
    </section>
  );
}
