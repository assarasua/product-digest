export type Book = {
  id: number;
  title: string;
  description: string;
  url: string;
  createdAt: string;
  updatedAt: string;
};

type RawBook = {
  id: number | string;
  title: string;
  description: string;
  book_url: string;
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

function mapBook(raw: RawBook): Book {
  return {
    id: Number(raw.id),
    title: String(raw.title || ""),
    description: String(raw.description || ""),
    url: String(raw.book_url || ""),
    createdAt: String(raw.created_at || ""),
    updatedAt: String(raw.updated_at || "")
  };
}

export async function getBooksFromApi(limit = 100, offset = 0): Promise<Book[]> {
  try {
    const apiBase = getApiBaseUrl();
    const response = await fetchWithTimeout(
      `${apiBase}/api/books?limit=${limit}&offset=${offset}`,
      { next: { revalidate: 600 } },
      5000
    );

    if (!response.ok) return [];
    const payload = (await response.json()) as { books?: RawBook[] };
    if (!Array.isArray(payload.books)) return [];
    return payload.books.map(mapBook).filter((book) => book.id > 0);
  } catch {
    return [];
  }
}
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
