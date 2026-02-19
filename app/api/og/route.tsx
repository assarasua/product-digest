import { ImageResponse } from "next/og";

export const runtime = "edge";
export const revalidate = 3600;

const size = {
  width: 1200,
  height: 630
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Product Digest";
  const subtitle = searchParams.get("subtitle") || "Gestión de producto, AI PM y estrategia SaaS";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #f7f4eb 0%, #f0ead9 55%, #e6f5ec 100%)",
          padding: "56px 64px",
          color: "#1f211b"
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#1f7a3f",
            letterSpacing: "0.02em"
          }}
        >
          PRODUCT DIGEST
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.04,
              fontWeight: 800,
              maxWidth: "1040px"
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 31,
              lineHeight: 1.25,
              color: "#4d4f46",
              maxWidth: "980px"
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            fontSize: 24,
            color: "#4d4f46"
          }}
        >
          productdigest.es
        </div>
      </div>
    ),
    size
  );
}
