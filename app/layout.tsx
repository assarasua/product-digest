import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { NavigationTracker } from "@/components/NavigationTracker";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { ogImageUrl } from "@/lib/seo";
import { Providers } from "./providers";
import "../styles/globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://productdigest.es";
const siteName = "Product Digest";
const siteDescription =
  "Análisis diario sobre gestión de producto, AI PM y estrategia SaaS con marcos aplicables para equipos en crecimiento.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"]
  },
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  keywords: [
    "product management",
    "gestión de producto",
    "ai product management",
    "estrategia saas",
    "roadmap",
    "discovery"
  ],
  category: "technology",
  alternates: {
    canonical: "/"
  },
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName,
    title: siteName,
    description: siteDescription,
    url: siteUrl,
    images: [
      {
        url: ogImageUrl("Product Digest", "Análisis diario sobre gestión de producto")
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [ogImageUrl("Product Digest", "Análisis diario sobre gestión de producto")]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1
    }
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    inLanguage: "es-ES",
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl
    }
  };

  return (
    <html lang="es">
      <body>
        <Providers>
          <NavigationTracker />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
          <div className="site-shell">
            <header className="site-header">
              <nav className="site-nav">
                <Link href="/" className="brand-link">
                  Product Digest
                </Link>
                <div className="nav-links">
                  <Link href="/product-leaders-wiki">Product Leaders</Link>
                  <Link href="/eventos">Eventos</Link>
                  <Link href="/tags">Temas</Link>
                  <Link href="/archive">Archivo</Link>
                  <Link href="/search">Buscar</Link>
                  <Link href="/about">Acerca de</Link>
                </div>
              </nav>
            </header>
            <main>{children}</main>
            <div className="page-wrap">
              <NewsletterSignup />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
