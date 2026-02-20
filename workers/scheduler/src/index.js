export default {
  async scheduled(event, env, ctx) {
    const startedAt = new Date().toISOString();
    const endpoint = `${String(env.PUBLISH_API_URL || "").replace(/\/+$/, "")}/api/posts/publish-due`;

    const run = async () => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.CRON_SECRET}`,
          "Content-Type": "application/json"
        }
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`publish_due_failed status=${response.status} body=${text}`);
      }

      console.log(`[scheduler] ok at=${startedAt} body=${text}`);
    };

    ctx.waitUntil(run());
  }
};
