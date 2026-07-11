const {
  corsPreflight,
  json,
  methodNotAllowed,
  parseJsonBody,
  requireSupabaseEnv,
  safeJsonResponse,
  supabaseHeaders,
  verifyAdmin
} = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return corsPreflight();
  if (event.httpMethod !== "POST") return methodNotAllowed();

  const adminError = verifyAdmin(event);
  if (adminError) return adminError;

  const parsedBody = parseJsonBody(event);
  if (parsedBody.error) return parsedBody.error;
  const { id, status } = parsedBody.payload;
  if (!id || !["published", "rejected", "removed", "deleted"].includes(status)) {
    return json(400, { code: "INVALID_MODERATION_REQUEST", message: "Invalid moderation request." });
  }

  const env = requireSupabaseEnv();
  if (env.error) return env.error;
  const { url, serviceKey } = env;

  const baseHeaders = supabaseHeaders(serviceKey);

  if (status === "deleted") {
    const lookup = await fetch(`${url}/rest/v1/video_submissions?select=id,storage_bucket,storage_path&id=eq.${encodeURIComponent(id)}&limit=1`, {
      headers: baseHeaders
    });
    const parsedLookup = await safeJsonResponse(lookup, "Supabase did not return JSON while finding the submission.");
    const rows = parsedLookup.data || [];
    if (!lookup.ok) {
      return json(lookup.status, { code: parsedLookup.error?.code || "SUBMISSION_LOOKUP_FAILED", message: rows?.message || parsedLookup.error?.message || "Could not find submission." });
    }

    const submission = rows[0];
    if (!submission) {
      return json(404, { code: "SUBMISSION_NOT_FOUND", message: "Submission not found." });
    }

    if (submission.storage_path) {
      await fetch(`${url}/storage/v1/object/${submission.storage_bucket || "clip-submissions"}`, {
        method: "DELETE",
        headers: {
          ...baseHeaders,
          "content-type": "application/json"
        },
        body: JSON.stringify({ prefixes: [submission.storage_path] })
      });
    }

    const deleteResponse = await fetch(`${url}/rest/v1/video_submissions?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        ...baseHeaders,
        prefer: "return=representation"
      }
    });
    const parsedDeleted = await safeJsonResponse(deleteResponse, "Supabase did not return JSON while deleting the submission.");
    if (!deleteResponse.ok) {
      return json(deleteResponse.status, { code: parsedDeleted.error?.code || "SUBMISSION_DELETE_FAILED", message: parsedDeleted.data?.message || parsedDeleted.error?.message || "Could not delete submission." });
    }
    return json(200, { result: parsedDeleted.data || [] });
  }

  const response = await fetch(`${url}/rest/v1/video_submissions?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      ...baseHeaders,
      "content-type": "application/json",
      prefer: "return=representation"
    },
    body: JSON.stringify({ status, reviewed_at: new Date().toISOString() })
  });
  const parsed = await safeJsonResponse(response, "Supabase did not return JSON while moderating the submission.");
  if (!response.ok) {
    return json(response.status, { code: parsed.error?.code || "MODERATION_FAILED", message: parsed.data?.message || parsed.error?.message || "Moderation failed." });
  }
  return json(200, { result: parsed.data || [] });
};
