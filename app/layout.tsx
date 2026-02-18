import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import type { ReactNode } from "react";

import "../styles/globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Product Digest",
    template: "%s | Product Digest"
  },
  description: "Analisis y escritura diaria sobre gestion de producto.",
  openGraph: {
    type: "website",
    title: "Product Digest",
    description: "Analisis y escritura diaria sobre gestion de producto.",
    url: siteUrl
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Digest",
    description: "Analisis y escritura diaria sobre gestion de producto."
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang="es">
      <body>
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.outbound-links.js"
          />
        ) : null}
        <div className="site-shell">
          <header className="site-header">
            <nav className="site-nav">
              <Link href="/" className="brand-link">
                Product Digest
              </Link>
              <div className="nav-links">
                <Link href="/tags">Temas</Link>
                <Link href="/archive">Archivo</Link>
                <Link href="/search">Buscar</Link>
                <Link href="/about">Acerca de Product Digest</Link>
              </div>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
