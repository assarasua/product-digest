const baseUrl = process.env.CHECK_API_BASE_URL || "https://api.productdigest.es";
const origin = process.env.CHECK_API_ORIGIN || "https://productdigest.es";
const email = process.env.CHECK_API_EMAIL || `check-${Date.now()}@example.com`;

const healthUrl = new URL("/healthz", baseUrl).toString();
const subscribeUrl = new URL("/api/subscribers", baseUrl).toString();

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

async function checkHealth() {
  printSection("Health");
  const response = await fetch(healthUrl, { method: "GET" });
  const body = await response.text();
  console.log(`GET ${healthUrl}`);
  console.log(`Status: ${response.status}`);
  console.log(`Body: ${body}`);
  return response.ok;
}

async function checkPreflight() {
  printSection("CORS Preflight");
  const response = await fetch(subscribeUrl, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type"
    }
  });

  console.log(`OPTIONS ${subscribeUrl}`);
  console.log(`Status: ${response.status}`);
  console.log(`Access-Control-Allow-Origin: ${response.headers.get("access-control-allow-origin") || "-"}`);
  console.log(`Access-Control-Allow-Methods: ${response.headers.get("access-control-allow-methods") || "-"}`);
  console.log(`Access-Control-Allow-Headers: ${response.headers.get("access-control-allow-headers") || "-"}`);
  return response.ok;
}

async function checkSubscribe() {
  printSection("POST Subscribe");
  const response = await fetch(subscribeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin
    },
    body: JSON.stringify({ email })
  });
  const body = await response.text();

  console.log(`POST ${subscribeUrl}`);
  console.log(`Payload email: ${email}`);
  console.log(`Status: ${response.status}`);
  console.log(`Body: ${body}`);
  return response.ok || response.status === 409;
}

try {
  const healthOk = await checkHealth();
  const corsOk = await checkPreflight();
  const postOk = await checkSubscribe();

  const success = healthOk && corsOk && postOk;
  console.log(`\nResultado: ${success ? "OK" : "FAIL"}`);
  process.exit(success ? 0 : 1);
} catch (error) {
  console.error("\nResultado: FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
