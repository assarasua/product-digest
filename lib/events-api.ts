export type Event = {
  id: number;
  title: string;
  description: string;
  dateConfirmed: boolean;
  date: string;
  time: string;
  venue: string;
  ticketingUrl: string;
  url: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

type RawEvent = {
  id: number | string;
  title: string;
  description: string;
  date_confirmed?: boolean;
  event_date: string;
  event_time: string;
  venue: string;
  ticketing_url: string;
  event_url: string;
  timezone?: string;
  created_at?: string;
  updated_at?: string;
};

function getApiBaseUrl(): string {
  return (
    process.env.POSTS_API_BASE_URL ||
    process.env.NEXT_PUBLIC_POSTS_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://api.productdigest.es"
  ).replace(/\/+$/, "");
}

function normalizeTime(value: string): string {
  const match = String(value || "").match(/^(\d{2}:\d{2})/);
  return match ? match[1] : String(value || "");
}

function mapEvent(raw: RawEvent): Event {
  return {
    id: Number(raw.id),
    title: String(raw.title || ""),
    description: String(raw.description || ""),
    dateConfirmed: raw.date_confirmed !== false,
    date: String(raw.event_date || ""),
    time: normalizeTime(String(raw.event_time || "")),
    venue: String(raw.venue || ""),
    ticketingUrl: String(raw.ticketing_url || ""),
    url: String(raw.event_url || ""),
    timezone: String(raw.timezone || "Europe/Madrid"),
    createdAt: String(raw.created_at || ""),
    updatedAt: String(raw.updated_at || "")
  };
}

export async function getPublicEventsFromApi(limit = 50, offset = 0): Promise<Event[]> {
  try {
    const apiBase = getApiBaseUrl();
    const response = await fetchWithTimeout(
      `${apiBase}/api/events?public=true&limit=${limit}&offset=${offset}`,
      { next: { revalidate: 300 } },
      5000
    );

    if (!response.ok) return [];
    const payload = (await response.json()) as { events?: RawEvent[] };
    if (!Array.isArray(payload.events)) return [];
    return payload.events.map(mapEvent).filter((event) => event.id > 0);
  } catch {
    return [];
  }
}
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
