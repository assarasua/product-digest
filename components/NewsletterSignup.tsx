"use client";

import { useId, useState } from "react";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import type { NewsletterSource } from "@/lib/analytics";
import { trackAnalyticsEvent } from "@/lib/analytics";

type NewsletterSignupProps = {
  title?: string;
  description?: string;
  source: NewsletterSource;
  onSuccess?: () => void;
};

export function NewsletterSignup({
  title = "Únete a la familia Product Digest",
  description = "Déjanos tu email y te enviaremos ideas aplicables para construir mejor producto.",
  source,
  onSuccess
}: NewsletterSignupProps) {
  const apiBaseUrl = resolveApiBaseUrl(
    process.env.NEXT_PUBLIC_POSTS_API_BASE_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL
  );
  const subscribeUrl = `${apiBaseUrl}/api/subscribers`;
  const inputId = useId();
  const statusId = `${inputId}-status`;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  return (
    <section className="newsletter-card" aria-label="Únete a Product Digest">
      <h2>{title}</h2>
      <p>{description}</p>

      <form
        className="newsletter-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setStatus("loading");
          trackAnalyticsEvent({ type: "newsletter_submit_start", source });

          try {
            const response = await fetch(subscribeUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, source })
            });

            if (response.ok) {
              setEmail("");
              setStatus("success");
              trackAnalyticsEvent({ type: "newsletter_submit_success", source, outcome: "created" });
              onSuccess?.();
              return;
            }

            let payload: { error?: string } = {};
            try {
              payload = (await response.json()) as { error?: string };
            } catch {
              payload = {};
            }

            if (payload.error === "duplicate") {
              setStatus("duplicate");
              trackAnalyticsEvent({ type: "newsletter_submit_success", source, outcome: "duplicate" });
              onSuccess?.();
              return;
            }

            setStatus("error");
            trackAnalyticsEvent({ type: "newsletter_submit_error", source, reason: "api" });
          } catch {
            setStatus("error");
            trackAnalyticsEvent({ type: "newsletter_submit_error", source, reason: "network" });
          }
        }}
      >
        <label htmlFor={inputId} className="newsletter-label">
          Email
        </label>
        <div className="newsletter-row">
          <input
            id={inputId}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@email.com"
            className="newsletter-input"
            value={email}
            aria-describedby={status !== "idle" ? statusId : undefined}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" className="newsletter-button" disabled={status === "loading"}>
            {status === "loading" ? "Enviando..." : "Unirme"}
          </button>
        </div>
      </form>

      <p id={statusId} className="newsletter-note" role="status" aria-live="polite">
        {status === "success" ? "Gracias. Ya formas parte de Product Digest." : null}
        {status === "duplicate" ? "Ese email ya está registrado." : null}
        {status === "error" ? "No se pudo guardar tu email. Inténtalo de nuevo." : null}
      </p>
    </section>
  );
}
