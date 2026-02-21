import type { Metadata } from "next";

import { EventCard } from "@/components/EventCard";
import { getPublicEventsFromApi } from "@/lib/events-api";
import { ogImageUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "El lugar donde Product Managers, Product Leaders y Product Builders descubren los eventos clave para aprender, conectar y construir mejor producto.",
  alternates: {
    canonical: "/eventos"
  },
  openGraph: {
    title: "Eventos | Product Digest",
    description:
      "El lugar donde Product Managers, Product Leaders y Product Builders descubren los eventos clave para aprender, conectar y construir mejor producto.",
    url: "/eventos",
    type: "website",
    images: [{ url: ogImageUrl("Eventos", "Agenda vigente para la comunidad de producto") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventos | Product Digest",
    description:
      "El lugar donde Product Managers, Product Leaders y Product Builders descubren los eventos clave para aprender, conectar y construir mejor producto.",
    images: [ogImageUrl("Eventos", "Agenda vigente para la comunidad de producto")]
  }
};

export default async function EventsPage() {
  const events = await getPublicEventsFromApi();

  return (
    <div className="page-wrap">
      <h1>Eventos</h1>
      <p className="page-intro">
        El lugar donde Product Managers, Product Leaders y Product Builders acuden para descubrir
        eventos clave, aprender de referentes y conectar con la comunidad global de producto.
      </p>

      {events.length === 0 ? (
        <p className="summary">No hay eventos disponibles ahora.</p>
      ) : (
        <section className="events-grid" aria-label="Eventos vigentes">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}
    </div>
  );
}
