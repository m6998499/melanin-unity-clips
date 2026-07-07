exports.handler = async (event) => {
  if (event.headers["x-admin-pin"] !== process.env.ADMIN_PIN) {
    return { statusCode: 401, body: JSON.stringify({ error: "Invalid admin PIN." }) };
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Missing Supabase environment variables." }) };
  }

  const response = await fetch(`${url}/rest/v1/video_submissions?select=*&order=created_at.desc`, {
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`
    }
  });
  const submissions = await response.json();
  return { statusCode: response.status, body: JSON.stringify({ submissions }) };
};
