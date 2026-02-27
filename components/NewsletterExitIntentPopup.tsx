"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics";
import { NewsletterSignup } from "@/components/NewsletterSignup";

const dismissedAtKey = "pd-newsletter-popup:dismissed-at";
const shownSessionKey = "pd-newsletter-popup:shown-session";
const subscribedSessionKey = "pd-newsletter-popup:subscribed-session";
function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
}

export function NewsletterExitIntentPopup({ cooldownDays = 7, enabled = true }: { cooldownDays?: number; enabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const canShowRef = useRef(false);
  const wasOpenedRef = useRef(false);
  const closeReasonRef = useRef<"close-button" | "overlay" | "escape" | "success">("close-button");
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const cooldownMs = useMemo(() => Math.max(1, cooldownDays) * 24 * 60 * 60 * 1000, [cooldownDays]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const dismissedAt = Number(window.localStorage.getItem(dismissedAtKey) || "0");
    const shownThisSession = window.sessionStorage.getItem(shownSessionKey) === "1";
    const subscribedThisSession = window.sessionStorage.getItem(subscribedSessionKey) === "1";
    canShowRef.current = !shownThisSession && !subscribedThisSession && (!dismissedAt || Date.now() - dismissedAt >= cooldownMs);
  }, [cooldownMs, enabled]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !canShowRef.current) {
      return;
    }

    const showPopup = (trigger: "exit-intent-desktop" | "back-intent-mobile") => {
      if (!canShowRef.current) return;

      canShowRef.current = false;
      wasOpenedRef.current = true;
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      window.sessionStorage.setItem(shownSessionKey, "1");
      trackAnalyticsEvent({ type: "newsletter_popup_shown", trigger });
      setIsOpen(true);
    };

    const onMouseLeave = (event: MouseEvent) => {
      if (isMobileViewport()) return;
      if (event.clientY <= 0) {
        showPopup("exit-intent-desktop");
      }
    };

    let hiddenAt = 0;

    const onPopState = () => {
      if (!isMobileViewport()) return;
      showPopup("back-intent-mobile");
    };

    const onVisibilityChange = () => {
      if (!isMobileViewport()) return;
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }

      if (document.visibilityState === "visible" && hiddenAt > 0) {
        const wasBriefLeave = Date.now() - hiddenAt <= 45000;
        hiddenAt = 0;
        if (wasBriefLeave) {
          showPopup("back-intent-mobile");
        }
      }
    };

    document.addEventListener("mouseleave", onMouseLeave);
    if (isMobileViewport()) {
      window.addEventListener("popstate", onPopState);
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("visibilitychange", onVisibilityChange);
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
    if (closeReasonRef.current !== "success") {
      window.localStorage.setItem(dismissedAtKey, String(Date.now()));
    }
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
          <li>Un email semanal en español.</li>
          <li>Marcos accionables para decisiones de producto.</li>
          <li>Sin spam, baja en un clic.</li>
        </ul>
        <NewsletterSignup
          source="popup-exit-intent"
          title="Antes de irte: únete al Product Knowledge Center"
          description="Recibe una selección breve con lo más útil para PMs de producto y AI."
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
