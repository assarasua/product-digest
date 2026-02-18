import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acerca de Product Digest",
  description: "Acerca de Product Digest y su enfoque con IA."
};

export default function AboutPage() {
  return (
    <div className="page-wrap slim">
      <h1>Acerca de Product Digest</h1>
      <p className="page-intro">
        Este sitio recopila analisis de gestion de producto, AI PM, estrategia SaaS y marcos operativos para equipos en
        crecimiento.
      </p>
      <p>
        El enfoque es simple: publicar de forma constante aprendizajes aplicables, con ejemplos, tradeoffs y decisiones
        accionables.
      </p>
      <p>
        Parte del contenido se genera con IA y se edita para mantener claridad, rigor y utilidad practica. La idea es
        explicar conceptos complejos de forma divulgativa para que cualquier PM pueda aplicarlos en su contexto real.
      </p>
      <p>
        Encontraras ejemplos concretos como: como priorizar cuando faltan datos, como diseñar experimentos de producto
        en equipos pequeños, y como convertir feedback de usuarios en decisiones de roadmap mas solidas.
      </p>
      <p>
        El objetivo no es solo escribir, sino construir una base de conocimiento util para hacer mejor producto bajo
        incertidumbre.
      </p>
    </div>
  );
}
