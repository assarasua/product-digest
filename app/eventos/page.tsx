import type { Metadata } from "next";

import { EventCard } from "@/components/EventCard";
import { getPublicEventsFromApi } from "@/lib/events-api";
import { ogImageUrl } from "@/lib/seo";

export const revalidate = 300;

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
  const now = Date.now();

  const withTimestamp = events.map((event) => {
    const baseTime = event.time?.length === 5 ? `${event.time}:00` : event.time;
    const timestamp = event.dateConfirmed ? Date.parse(`${event.date}T${baseTime || "00:00:00"}`) : Number.POSITIVE_INFINITY;
    return {
      event,
      timestamp: Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp
    };
  });

  const upcomingEvents = withTimestamp
    .filter((item) => item.timestamp >= now)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item) => item.event);

  const pastEvents = withTimestamp
    .filter((item) => item.timestamp < now)
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((item) => item.event);

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
        <>
          <section className="events-section" aria-label="Próximos eventos">
            <h2 className="events-section-title">Próximos eventos</h2>
            {upcomingEvents.length === 0 ? (
              <p className="summary">No hay próximos eventos por ahora.</p>
            ) : (
              <div className="events-grid">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>

          <section className="events-section" aria-label="Eventos pasados">
            <h2 className="events-section-title">Eventos pasados</h2>
            {pastEvents.length === 0 ? (
              <p className="summary">Aún no hay eventos pasados.</p>
            ) : (
              <div className="events-grid">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
