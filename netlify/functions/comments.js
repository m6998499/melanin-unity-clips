const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(body)
});

const cleanText = (value, maxLength) => String(value || "").trim().slice(0, maxLength);
const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || "");

exports.handler = async (event) => {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return json(500, { error: "Missing Supabase environment variables." });
  }

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    "content-type": "application/json"
  };

  if (event.httpMethod === "GET") {
    const submissionId = event.queryStringParameters?.submission_id;
    if (!isUuid(submissionId)) return json(400, { error: "Invalid submission id." });

    const response = await fetch(`${url}/rest/v1/video_comments?select=id,author_name,body,created_at&submission_id=eq.${encodeURIComponent(submissionId)}&status=eq.visible&order=created_at.asc&limit=100`, {
      headers
    });
    const comments = await response.json();
    if (!response.ok) return json(response.status, { error: comments?.message || "Could not load comments." });
    return json(200, { comments });
  }

  if (event.httpMethod === "POST") {
    const payload = JSON.parse(event.body || "{}");
    const submissionId = payload.submission_id;
    const authorName = cleanText(payload.author_name, 40) || "Guest";
    const body = cleanText(payload.body, 500);
    if (!isUuid(submissionId)) return json(400, { error: "Invalid submission id." });
    if (!body) return json(400, { error: "Write a comment first." });

    const response = await fetch(`${url}/rest/v1/video_comments`, {
      method: "POST",
      headers: {
        ...headers,
        prefer: "return=representation"
      },
      body: JSON.stringify({
        submission_id: submissionId,
        author_name: authorName,
        body,
        status: "visible"
      })
    });
    const result = await response.json();
    if (!response.ok) return json(response.status, { error: result?.message || "Could not save comment." });
    return json(200, { comment: result[0] });
  }

  return json(405, { error: "Method not allowed." });
};
