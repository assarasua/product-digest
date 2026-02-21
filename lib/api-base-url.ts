const DEFAULT_API_BASE_URL = "https://api.productdigest.es";

function toCandidate(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

function normalizeHttpUrl(value: string): string | null {
  const withProtocol =
    value.startsWith("http://") || value.startsWith("https://")
      ? value
      : value.startsWith("//")
        ? `https:${value}`
        : `https://${value}`;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    // API base URL must be origin-level. Strip accidental API suffixes.
    const normalizedPath = parsed.pathname.replace(/\/+$/, "").replace(/\/api$/, "");
    parsed.pathname = normalizedPath || "/";
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export function resolveApiBaseUrl(...values: Array<string | undefined>): string {
  for (const rawValue of values) {
    const candidate = toCandidate(rawValue);
    if (!candidate) continue;
    const normalized = normalizeHttpUrl(candidate);
    if (normalized) return normalized;
  }

  return DEFAULT_API_BASE_URL;
}
