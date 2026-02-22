import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Información sobre cookies y preferencias de consentimiento en Product Digest.",
  alternates: {
    canonical: "/cookies"
  }
};

export default function CookiesPage() {
  return (
    <div className="page-wrap slim">
      <h1>Cookies</h1>
      <p className="page-intro">
        En Product Digest utilizamos cookies esenciales para el funcionamiento del sitio y, con tu consentimiento,
        cookies analíticas para mejorar contenido y rendimiento.
      </p>
      <section className="archive-month">
        <h2>Tipos de cookies</h2>
        <ul>
          <li>
            <strong>Esenciales</strong>
            <span>Necesarias para navegación, seguridad y funciones básicas.</span>
          </li>
          <li>
            <strong>Analíticas</strong>
            <span>Permiten medir uso del sitio y detectar mejoras de experiencia.</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

