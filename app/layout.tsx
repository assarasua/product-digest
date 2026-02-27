import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CookieBanner } from "@/components/CookieBanner";
import { NavigationTracker } from "@/components/NavigationTracker";
import { NewsletterExitIntentPopup } from "@/components/NewsletterExitIntentPopup";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { PageTransition } from "@/components/PageTransition";
import { SiteHeader } from "@/components/SiteHeader";
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
            <a href="#main-content" className="skip-link">
              Saltar al contenido principal
            </a>
            <header className="site-header">
              <SiteHeader />
            </header>
            <main id="main-content" tabIndex={-1}>
              <PageTransition>{children}</PageTransition>
            </main>
            <div className="page-wrap">
              <NewsletterSignup source="global" />
            </div>
            <NewsletterExitIntentPopup cooldownDays={7} />
            <CookieBanner />
          </div>
        </Providers>
      </body>
    </html>
  );
}
