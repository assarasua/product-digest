import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wiki para Product Leaders",
  description: "Top 50 Product Leaders: nombre, apellido, imagen, descripción y perfil.",
  alternates: {
    canonical: "/product-leaders-wiki"
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
  const apiBase =
    process.env.PRODUCT_LEADERS_API_BASE_URL ??
    process.env.NEXT_PUBLIC_PRODUCT_LEADERS_API_BASE_URL ??
    "https://api.productdigest.es";

  try {
    const response = await fetch(`${apiBase}/api/product-leaders`, {
      next: { revalidate: 3600 }
    });

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
      <h1>Wiki para Product Leaders</h1>
      <p className="page-intro">
        Base de datos de líderes de producto con perfil, imagen y descripción para investigación rápida.
      </p>

      {leaders.length === 0 ? (
        <p className="summary">Aún no hay datos cargados. Ejecuta el importador para poblar esta sección.</p>
      ) : (
        <section className="leaders-grid" aria-label="Top Product Leaders">
          {leaders.map((leader) => (
            <article key={`${leader.rank}-${leader.profile_url}`} className="leader-card">
              <img src={leader.image_url} alt={`${leader.first_name} ${leader.last_name}`.trim()} loading="lazy" />
              <div>
                <p className="meta-row">#{leader.rank}</p>
                <h2>
                  {leader.first_name} {leader.last_name}
                </h2>
                <p className="summary">{leader.description}</p>
                <p>
                  <a href={leader.profile_url} target="_blank" rel="noopener noreferrer">
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
