import type { Event } from "@/lib/events-api";
import { formatDate } from "@/lib/format";

export function EventCard({ event }: { event: Event }) {
  const dateLabel = event.dateConfirmed ? formatDate(event.date) : "TBD";

  return (
    <article className="event-card">
      <p className="meta-row">
        {dateLabel} · {event.time} · {event.timezone}
      </p>
      <h2>{event.title}</h2>
      <p className="summary">{event.description}</p>
      <p className="event-venue">{event.venue}</p>
      <p className="event-links">
        <a href={event.url} target="_blank" rel="noopener noreferrer">
          Web oficial
        </a>
        <a href={event.ticketingUrl} target="_blank" rel="noopener noreferrer">
          Entradas
        </a>
      </p>
    </article>
  );
}
