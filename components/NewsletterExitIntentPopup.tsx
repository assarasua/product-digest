"use client";

import { useEffect, useRef, useState } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics";
import { NewsletterSignup } from "@/components/NewsletterSignup";

const shownEverKey = "pd-newsletter-popup:shown-ever";
const subscribedSessionKey = "pd-newsletter-popup:subscribed-session";
const popupDelayMs = 30_000;

export function NewsletterExitIntentPopup({ enabled = true }: { enabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const canShowRef = useRef(false);
  const wasOpenedRef = useRef(false);
  const closeReasonRef = useRef<"close-button" | "overlay" | "escape" | "success">("close-button");
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const shownEver = window.localStorage.getItem(shownEverKey) === "1";
    const subscribedThisSession = window.sessionStorage.getItem(subscribedSessionKey) === "1";
    canShowRef.current = !shownEver && !subscribedThisSession;
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !canShowRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (!canShowRef.current) return;

      canShowRef.current = false;
      wasOpenedRef.current = true;
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      window.localStorage.setItem(shownEverKey, "1");
      trackAnalyticsEvent({ type: "newsletter_popup_shown", trigger: "time-on-page-30s" });
      setIsOpen(true);
    }, popupDelayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [enabled]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const targetInput = modalRef.current?.querySelector<HTMLInputElement>("input[type='email']");
    targetInput?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeReasonRef.current = "escape";
        setIsOpen(false);
        return;
      }

      if (event.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        if (!focusable || focusable.length === 0) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || !enabled || !wasOpenedRef.current) return;

    trackAnalyticsEvent({ type: "newsletter_popup_dismissed", reason: closeReasonRef.current });
    previousFocusRef.current?.focus();
    wasOpenedRef.current = false;
  }, [enabled, isOpen]);

  if (!enabled || !isOpen) {
    return null;
  }

  return (
    <div
      className="newsletter-popup-overlay"
      onClick={() => {
        closeReasonRef.current = "overlay";
        setIsOpen(false);
      }}
    >
      <div
        ref={modalRef}
        className="newsletter-popup-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Suscríbete a Product Digest"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="newsletter-popup-head">
          <p className="newsletter-popup-kicker">Product Digest semanal</p>
          <button
            type="button"
            className="newsletter-popup-close"
            onClick={() => {
              closeReasonRef.current = "close-button";
              setIsOpen(false);
            }}
          >
            Cerrar
          </button>
        </div>
        <ul className="newsletter-popup-benefits" aria-label="Beneficios de suscripción">
          <li>Solo 1 email a la semana en español, directo y accionable.</li>
          <li>Ideas de AI Product Management que puedes aplicar en menos de 10 minutos.</li>
          <li>Sin ruido: cero spam y baja en un clic.</li>
        </ul>
        <NewsletterSignup
          source="popup-exit-intent"
          title="Llévate cada semana lo más útil para construir mejor producto"
          description="Únete a Product Digest y recibe frameworks, casos y recursos curados para PMs y líderes de producto."
          onSuccess={() => {
            window.sessionStorage.setItem(subscribedSessionKey, "1");
            closeReasonRef.current = "success";
            setIsOpen(false);
          }}
        />
        <button
          type="button"
          className="newsletter-popup-dismiss"
          onClick={() => {
            closeReasonRef.current = "close-button";
            setIsOpen(false);
          }}
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
