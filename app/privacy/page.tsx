import type { Metadata } from "next";

import { ogImageUrl } from "@/lib/seo";

const title = "Política de privacidad";
const description = "Cómo tratamos tus datos en Product Digest: cookies, analítica, suscripciones y derechos RGPD.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/privacy"
  },
  openGraph: {
    title,
    description,
    url: "/privacy",
    type: "website",
    images: [{ url: ogImageUrl("Política de privacidad", "Cookies, analítica y derechos RGPD en Product Digest") }]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImageUrl("Política de privacidad", "Cookies, analítica y derechos RGPD en Product Digest")]
  }
};

export default function PrivacyPage() {
  return (
    <div className="page-wrap slim">
      <h1>Política de privacidad</h1>
      <p className="page-intro">
        En Product Digest tratamos los datos con un enfoque de minimización: solo lo necesario para operar el sitio y
        mejorar contenidos cuando nos das consentimiento.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        Responsable: Product Digest. Si quieres ejercer tus derechos de protección de datos, puedes escribir a{" "}
        <a href="mailto:privacy@productdigest.es">privacy@productdigest.es</a>.
      </p>

      <h2>2. Qué datos tratamos</h2>
      <p>Tratamos tres tipos principales de datos:</p>
      <ul>
        <li>Preferencias de consentimiento de cookies (cookie técnica y almacenamiento local).</li>
        <li>Métricas analíticas agregadas y no esenciales solo si aceptas analítica.</li>
        <li>Email de suscripción si decides unirte a la comunidad.</li>
      </ul>

      <h2>3. Finalidades y base legal</h2>
      <ul>
        <li>Cookies necesarias: funcionamiento técnico del sitio (interés legítimo).</li>
        <li>Cookies analíticas: medición de uso y mejora editorial (consentimiento explícito).</li>
        <li>Suscripción por email: envío de contenidos y novedades (consentimiento).</li>
      </ul>

      <h2>4. Cookies utilizadas</h2>
      <ul>
        <li>
          Necesarias: cookie técnica de consentimiento `pd_cookie_consent` para recordar tu decisión.
        </li>
        <li>Analítica: herramientas de medición solo cuando activas la categoría de analítica.</li>
      </ul>

      <h2>5. Conservación de datos</h2>
      <ul>
        <li>Consentimiento de cookies: hasta 6 meses o hasta que lo cambies.</li>
        <li>Datos de suscripción: hasta baja voluntaria o solicitud de supresión.</li>
        <li>Métricas analíticas: según políticas del proveedor y configuración vigente.</li>
      </ul>

      <h2>6. Encargados y terceros</h2>
      <p>
        Para operar Product Digest podemos usar proveedores de infraestructura y datos como Cloudflare (hosting/caché),
        Railway (base de datos/servicios) y proveedor de analítica, siempre bajo tus preferencias de consentimiento.
      </p>

      <h2>7. Derechos RGPD</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad
        contactando en <a href="mailto:privacy@productdigest.es">privacy@productdigest.es</a>. También puedes retirar
        tu consentimiento de analítica en cualquier momento desde “Preferencias de cookies”.
      </p>

      <h2>8. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política para reflejar cambios legales o técnicos. La fecha de última actualización se
        mostrará en esta página.
      </p>

      <p style={{ marginTop: 24, color: "#6a665b" }}>Última actualización: 20 de febrero de 2026.</p>
    </div>
  );
}
