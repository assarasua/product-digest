import type { Metadata } from "next";

import { EventCard } from "@/components/EventCard";
import { getPublicEventsFromApi } from "@/lib/events-api";
import { ogImageUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Eventos recomendados de producto: agenda vigente, lugar y enlaces de registro.",
  alternates: {
    canonical: "/eventos"
  },
  openGraph: {
    title: "Eventos | Product Digest",
    description: "Eventos recomendados de producto: agenda vigente, lugar y enlaces de registro.",
    url: "/eventos",
    type: "website",
    images: [{ url: ogImageUrl("Eventos", "Agenda vigente para la comunidad de producto") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventos | Product Digest",
    description: "Eventos recomendados de producto: agenda vigente, lugar y enlaces de registro.",
    images: [ogImageUrl("Eventos", "Agenda vigente para la comunidad de producto")]
  }
};

export default async function EventsPage() {
  const events = await getPublicEventsFromApi();

  return (
    <div className="page-wrap">
      <h1>Eventos</h1>
      <p className="page-intro">
        Selección de eventos vigentes para profesionales de producto. Cada evento permanece publicado hasta 3 días
        después de su fecha y hora clave.
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
