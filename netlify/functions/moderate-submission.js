exports.handler = async (event) => {
  if (event.headers["x-admin-pin"] !== process.env.ADMIN_PIN) {
    return { statusCode: 401, body: JSON.stringify({ error: "Invalid admin PIN." }) };
  }

  const { id, status } = JSON.parse(event.body || "{}");
  if (!id || !["published", "rejected", "removed"].includes(status)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid moderation request." }) };
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Missing Supabase environment variables." }) };
  }

  const response = await fetch(`${url}/rest/v1/video_submissions?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      "content-type": "application/json",
      prefer: "return=representation"
    },
    body: JSON.stringify({ status, reviewed_at: new Date().toISOString() })
  });
  const result = await response.json();
  return { statusCode: response.status, body: JSON.stringify({ result }) };
};
