import type { Metadata } from "next";

import { ogImageUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Aviso de cookies",
  description: "Información sobre cookies esenciales y analíticas en Product Digest.",
  alternates: {
    canonical: "/cookies"
  },
  openGraph: {
    title: "Aviso de cookies | Product Digest",
    description: "Información sobre cookies esenciales y analíticas en Product Digest.",
    url: "/cookies",
    type: "website",
    images: [{ url: ogImageUrl("Aviso de cookies", "Controla tus preferencias de cookies") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Aviso de cookies | Product Digest",
    description: "Información sobre cookies esenciales y analíticas en Product Digest.",
    images: [ogImageUrl("Aviso de cookies", "Controla tus preferencias de cookies")]
  }
};

export default function CookiesPage() {
  return (
    <div className="page-wrap slim">
      <h1>Aviso de cookies</h1>
      <p className="summary">
        En Product Digest usamos cookies esenciales para el funcionamiento del sitio y, si lo aceptas, cookies
        analíticas para mejorar la experiencia.
      </p>

      <h2>Cookies esenciales</h2>
      <p className="summary">
        Son necesarias para funciones básicas del sitio. Siempre están activas y no se pueden desactivar desde el
        banner.
      </p>

      <h2>Cookies analíticas</h2>
      <p className="summary">
        Solo se activan si das consentimiento explícito en el banner. Si rechazas, no cargamos InfiniteWatch ni
        Amplitude.
      </p>

      <h2>Cambiar preferencias</h2>
      <p className="summary">
        Puedes revisar tus preferencias desde el banner de cookies que aparece en la esquina inferior derecha cuando no
        existe una decisión guardada.
      </p>

      <p className="meta-row">Última actualización: 25 de febrero de 2026</p>
    </div>
  );
}
