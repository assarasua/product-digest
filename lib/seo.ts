const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://productdigest.es";

export function absoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function ogImageUrl(title: string, subtitle?: string) {
  const params = new URLSearchParams();
  params.set("title", title);
  if (subtitle) {
    params.set("subtitle", subtitle);
  }
  return absoluteUrl(`/api/og?${params.toString()}`);
}

export function getSiteUrl() {
  return siteUrl;
}
