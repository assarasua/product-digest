export const runtime = "edge";

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

  const subscribeApiUrl = process.env.NEWSLETTER_SUBSCRIBE_API_URL;

  if (!subscribeApiUrl) {
    return Response.json(
      {
        error: "missing_subscribe_api_url",
        message:
          "Define NEWSLETTER_SUBSCRIBE_API_URL to persist emails from Edge runtime."
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(subscribeApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    if (response.status === 409) {
      return Response.json({ error: "duplicate" }, { status: 409 });
    }

    if (!response.ok) {
      return Response.json({ error: "upstream_error" }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "upstream_unreachable" }, { status: 502 });
  }
}
