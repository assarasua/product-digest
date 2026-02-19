import type { Metadata } from "next";
import { ogImageUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Acerca de Product Digest",
  description: "Acerca de Product Digest y su enfoque con IA.",
  alternates: {
    canonical: "/about"
  },
  openGraph: {
    title: "Acerca de Product Digest",
    description: "Acerca de Product Digest y su enfoque con IA.",
    url: "/about",
    type: "website",
    images: [{ url: ogImageUrl("Acerca de Product Digest", "Misión editorial y enfoque práctico") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Acerca de Product Digest",
    description: "Acerca de Product Digest y su enfoque con IA.",
    images: [ogImageUrl("Acerca de Product Digest", "Misión editorial y enfoque práctico")]
  }
};

export default function AboutPage() {
  return (
    <div className="page-wrap slim">
      <h1>Acerca de Product Digest</h1>
      <p className="page-intro">
        Este sitio recopila análisis de gestión de producto, AI PM, estrategia SaaS y marcos operativos para equipos en
        crecimiento.
      </p>
      <p>
        El enfoque es simple: publicar de forma constante aprendizajes aplicables, con ejemplos, tradeoffs y decisiones
        accionables.
      </p>
      <p>
        Parte del contenido se genera con IA y se edita para mantener claridad, rigor y utilidad práctica. La idea es
        explicar conceptos complejos de forma divulgativa para que cualquier PM pueda aplicarlos en su contexto real.
      </p>
      <p>
        Encontrarás ejemplos concretos como: cómo priorizar cuando faltan datos, cómo diseñar experimentos de producto
        en equipos pequeños, y cómo convertir feedback de usuarios en decisiones de roadmap más sólidas.
      </p>
      <p>
        El objetivo no es solo escribir, sino construir una base de conocimiento útil para hacer mejor producto bajo
        incertidumbre.
      </p>
    </div>
  );
}
