import type { Metadata } from "next";
import { ogImageUrl } from "@/lib/seo";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

export const metadata: Metadata = {
  title: "Product Leaders",
  description:
    "Product Leaders reúne referentes de gestión de producto a nivel mundial: perfiles, contexto profesional y enlaces para seguir sus ideas y tendencias.",
  alternates: {
    canonical: "/product-leaders-wiki"
  },
  openGraph: {
    title: "Product Leaders",
    description:
      "Product Leaders reúne referentes de gestión de producto a nivel mundial: perfiles, contexto profesional y enlaces para seguir sus ideas y tendencias.",
    url: "/product-leaders-wiki",
    type: "website",
    locale: "es_ES",
    siteName: "Product Digest",
    images: [{ url: ogImageUrl("Product Leaders", "Referentes globales de gestión de producto") }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Leaders",
    description:
      "Product Leaders reúne referentes de gestión de producto a nivel mundial: perfiles, contexto profesional y enlaces para seguir sus ideas y tendencias.",
    images: [ogImageUrl("Product Leaders", "Referentes globales de gestión de producto")]
  }
};

export const revalidate = 3600;

type ProductLeader = {
  rank: number;
  first_name: string;
  last_name: string;
  image_url: string;
  description: string;
  profile_url: string;
};

async function getLeaders(): Promise<ProductLeader[]> {
  const apiBase = resolveApiBaseUrl(
    process.env.PRODUCT_LEADERS_API_BASE_URL,
    process.env.NEXT_PUBLIC_PRODUCT_LEADERS_API_BASE_URL,
    process.env.POSTS_API_BASE_URL,
    process.env.NEXT_PUBLIC_POSTS_API_BASE_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL
  );

  try {
    const response = await fetchWithTimeout(`${apiBase}/api/product-leaders`, { next: { revalidate: 3600 } }, 5000);

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { leaders?: ProductLeader[] };
    return Array.isArray(payload.leaders) ? payload.leaders : [];
  } catch {
    return [];
  }
}

export default async function ProductLeadersWikiPage() {
  const leaders = await getLeaders();

  return (
    <div className="page-wrap">
      <section className="hero">
        <p className="eyebrow">Product Leaders</p>
        <h1>Referentes globales para elevar tu criterio de producto.</h1>
        <p>
          Explora perfiles y trayectorias de líderes que están marcando cómo se diseña, prioriza y escala producto en
          compañías de alto impacto.
        </p>
      </section>

      {leaders.length === 0 ? (
        <p className="summary">Aún no hay datos cargados para Product Leaders.</p>
      ) : (
        <section className="leaders-grid" aria-label="Product Leaders">
          {leaders.map((leader) => (
            <article key={`${leader.rank}-${leader.profile_url}`} className="leader-card">
              <img src={leader.image_url} alt={`${leader.first_name} ${leader.last_name}`.trim()} loading="lazy" />
              <div className="leader-card-body">
                <p className="meta-row">#{leader.rank}</p>
                <h2>
                  {leader.first_name} {leader.last_name}
                </h2>
                <p className="summary">{leader.description}</p>
                <p className="leader-card-cta">
                  <a className="leader-profile-button" href={leader.profile_url} target="_blank" rel="noopener noreferrer">
                    Ver perfil
                  </a>
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
