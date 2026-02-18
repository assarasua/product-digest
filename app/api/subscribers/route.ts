import { addSubscriber } from "@/lib/subscribers-db";

export const runtime = "nodejs";

type Payload = {
  email?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const allowedOrigin = process.env.NEWSLETTER_ALLOWED_ORIGIN ?? "https://productdigest.es";

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
    const result = await addSubscriber(email);
    if (!result.ok && result.code === "duplicate") {
      return json({ error: "duplicate" }, 409);
    }
    if (!result.ok) {
      return json({ error: "db_error" }, 500);
    }
    return json({ ok: true });
  } catch {
    return json({ error: "db_unreachable" }, 502);
  }
}
