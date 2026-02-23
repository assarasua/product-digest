import type { Metadata } from "next";
import { ogImageUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Acerca de",
  description: "Acerca de Product Digest, su autor y el enfoque editorial.",
  alternates: {
    canonical: "/about"
  },
  openGraph: {
    title: "Acerca de",
    description: "Acerca de Product Digest, su autor y el enfoque editorial.",
    url: "/about",
    type: "website",
    images: [{ url: ogImageUrl("Acerca de", "Perfil del autor y misión editorial") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Acerca de",
    description: "Acerca de Product Digest, su autor y el enfoque editorial.",
    images: [ogImageUrl("Acerca de", "Perfil del autor y misión editorial")]
  }
};

export default function AboutPage() {
  return (
    <div className="page-wrap slim">
      <h1>Acerca de</h1>
      <p className="page-intro">
        Product Digest recopila análisis de gestión de producto, AI PM, estrategia y marcos operativos para equipos en
        crecimiento, con foco en aplicación real.
      </p>
      <p>
        Soy un líder de producto 360 y emprendedor con más de una década de experiencia construyendo y escalando
        productos en fintech, analítica de datos, IoT y healthtech. Mi trabajo cubre todo el ciclo: discovery,
        ejecución, go-to-market, operaciones y estrategia de negocio.
      </p>
      <p>
        Actualmente soy profesor en NYU Stern School of Business, Head of Product Incubation & Operations en Hutech
        Ventures y lidero alianzas B2B en Ultrahuman, mientras continúo mi trabajo como Creative Farmer en Bizkardo
        Lab.
      </p>
      <p>
        Mi trayectoria incluye fundar Kibber, ser parte temprana de MainTool, unirme al primer core team de Graphext y
        posteriormente desempeñarme como Group Product Manager en CoverWallet (Aon), liderando múltiples grupos de
        producto centrados en transformación digital, analítica y operaciones de seguros escalables en mercados
        internacionales.
      </p>
      <p>
        Web personal:{" "}
        <a href="https://bizkardolab.eu/" target="_blank" rel="noreferrer">
          https://bizkardolab.eu/
        </a>
      </p>
      <p>
        Parte del contenido se apoya en IA y siempre se revisa editorialmente para asegurar claridad, rigor y utilidad
        práctica.
      </p>
    </div>
  );
}
