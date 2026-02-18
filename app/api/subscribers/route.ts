import { addSubscriber } from "@/lib/subscribers-db";

type Payload = {
  email?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let payload: Payload;

  try {
    payload = (await request.json()) as Payload;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = payload.email?.trim();
  if (!email || !isValidEmail(email)) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  const result = await addSubscriber(email);
  if (result.ok) {
    return Response.json({ ok: true });
  }

  if (result.code === "duplicate") {
    return Response.json({ error: "duplicate" }, { status: 409 });
  }

  if (result.code === "pg_missing") {
    return Response.json({ error: "pg_missing" }, { status: 500 });
  }

  return Response.json({ error: "db_error" }, { status: 500 });
}
