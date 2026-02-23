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
      <div className="about-links" aria-label="Enlaces de perfil">
        <a className="about-link-button" href="https://bizkardolab.eu/" target="_blank" rel="noreferrer">
          Website
        </a>
        <a className="about-link-button" href="https://www.linkedin.com/in/asarasua/" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a className="about-link-button" href="https://x.com/assarasua" target="_blank" rel="noreferrer">
          X
        </a>
      </div>
      <p className="page-intro">
        Product Digest nace de una necesidad muy concreta: convertir años de decisiones difíciles en producto en
        aprendizajes útiles para otras personas que están construyendo bajo presión.
      </p>
      <p>
        Durante más de una década he trabajado como líder de producto 360 y emprendedor en fintech, analítica de
        datos, IoT y healthtech. En ese recorrido he vivido de todo: productos que escalan, apuestas que no salen como
        esperabas, equipos que crecen rápido y momentos en los que toca decidir con información incompleta.
      </p>
      <p>
        Product Digest surge justo ahí, en esa intersección entre estrategia y ejecución. Empecé a escribir para
        ordenar mis propios marcos mentales: cómo priorizar cuando todo parece urgente, cómo traducir señales de
        cliente en decisiones, y cómo alinear negocio, tecnología y operación sin perder foco.
      </p>
      <p>
        Mi trayectoria incluye fundar Kibber, ser parte temprana de MainTool, unirme al primer core team de Graphext y
        posteriormente desempeñarme como Group Product Manager en CoverWallet (Aon), liderando grupos de producto
        centrados en transformación digital, analítica y operaciones de seguros escalables en mercados internacionales.
      </p>
      <p>
        Hoy lidero Product Incubation & Operations en Hutech Ventures, desarrollo alianzas B2B en Ultrahuman y
        continúo mi trabajo como Creative Farmer en Bizkardo Lab. Product Digest es la extensión natural de ese
        camino: un espacio para compartir ideas accionables, sin humo, para crear mejor producto.
      </p>
      <p>
        No escribo personalmente los artículos: utilizo IA para generar contenido divulgativo en base al conocimiento
        ya existente en la materia a nivel global, y lo centralizo en este blog para hacerlo más accesible y útil.
      </p>
    </div>
  );
}
