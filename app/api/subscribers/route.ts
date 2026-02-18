export const runtime = "edge";

type Payload = {
  email?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const allowedOrigin = process.env.NEWSLETTER_ALLOWED_ORIGIN ?? "https://productdigest.es";
const upstreamUrl = process.env.NEWSLETTER_SUBSCRIBE_API_URL ?? "https://api.productdigest.es/api/subscribers";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  Vary: "Origin"
};

function json(payload: unknown, status = 200) {
  return Response.json(payload, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  let payload: Payload;

  try {
    payload = (await request.json()) as Payload;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const email = payload.email?.trim();
  if (!email || !isValidEmail(email)) {
    return json({ error: "invalid_email" }, 400);
  }

  try {
    const response = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    if (response.status === 409) {
      return json({ error: "duplicate" }, 409);
    }

    if (!response.ok) {
      return json({ error: "upstream_error" }, 502);
    }

    return json({ ok: true });
  } catch {
    return json({ error: "upstream_unreachable" }, 502);
  }
}
