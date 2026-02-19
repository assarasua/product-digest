const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://productdigest.es";
const defaultOgImagePath = "/og-default.jpg";

export function absoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function ogImageUrl(title: string, subtitle?: string) {
  void title;
  void subtitle;
  return absoluteUrl(defaultOgImagePath);
}

export function getSiteUrl() {
  return siteUrl;
}
