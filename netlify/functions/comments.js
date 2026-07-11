const {
  json,
  methodNotAllowed,
  parseJsonBody,
  requireSupabaseEnv,
  safeJsonResponse,
  supabaseHeaders
} = require("./_shared");

const cleanText = (value, maxLength) => String(value || "").trim().slice(0, maxLength);
const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || "");

exports.handler = async (event) => {
  const env = requireSupabaseEnv();
  if (env.error) return env.error;
  const { url, serviceKey } = env;

  const headers = {
    ...supabaseHeaders(serviceKey),
    "content-type": "application/json"
  };

  if (event.httpMethod === "GET") {
    const submissionId = event.queryStringParameters?.submission_id;
    if (!isUuid(submissionId)) return json(400, { error: "Invalid submission id." });

    const response = await fetch(`${url}/rest/v1/video_comments?select=id,author_name,body,created_at&submission_id=eq.${encodeURIComponent(submissionId)}&status=eq.visible&order=created_at.asc&limit=100`, {
      headers
    });
    const parsed = await safeJsonResponse(response, "Supabase did not return JSON while loading comments.");
    if (!response.ok) return json(response.status, { code: parsed.error?.code || "COMMENTS_LOAD_FAILED", message: parsed.data?.message || parsed.error?.message || "Could not load comments." });
    return json(200, { comments: parsed.data || [] });
  }

  if (event.httpMethod === "POST") {
    const parsedBody = parseJsonBody(event);
    if (parsedBody.error) return parsedBody.error;
    const payload = parsedBody.payload;
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
    const parsed = await safeJsonResponse(response, "Supabase did not return JSON while saving the comment.");
    if (!response.ok) return json(response.status, { code: parsed.error?.code || "COMMENT_SAVE_FAILED", message: parsed.data?.message || parsed.error?.message || "Could not save comment." });
    return json(200, { comment: parsed.data?.[0] });
  }

  return methodNotAllowed();
};
