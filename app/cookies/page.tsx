import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Información sobre el uso de cookies y gestión de preferencias en Product Digest.",
  alternates: {
    canonical: "/cookies"
  }
};

export default function CookiesPage() {
  return (
    <div className="page-wrap slim">
      <h1>Cookies</h1>
      <p className="page-intro">
        En Product Digest usamos cookies esenciales para el funcionamiento del sitio y, con tu consentimiento, cookies
        de analítica y de publicidad dirigida.
      </p>
      <section className="archive-month">
        <h2>Tipos de cookies</h2>
        <ul>
          <li>
            <strong>Esenciales</strong>
            <span>Necesarias para seguridad, navegación y funcionalidades básicas.</span>
          </li>
          <li>
            <strong>Analíticas</strong>
            <span>Nos ayudan a entender uso del sitio y mejorar contenido y rendimiento.</span>
          </li>
          <li>
            <strong>Publicidad dirigida</strong>
            <span>Permiten personalizar y medir campañas publicitarias.</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

