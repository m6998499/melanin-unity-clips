const {
  json,
  methodNotAllowed,
  parseJsonBody,
  requireSupabaseEnv,
  safeJsonResponse,
  supabaseHeaders
} = require("./_shared");

const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || "");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return methodNotAllowed();

  const env = requireSupabaseEnv();
  if (env.error) return env.error;
  const { url, serviceKey } = env;

  const parsedBody = parseJsonBody(event);
  if (parsedBody.error) return parsedBody.error;
  const { id, delete_token } = parsedBody.payload;
  if (!isUuid(id) || !isUuid(delete_token)) return json(400, { error: "Invalid delete request." });

  const headers = {
    ...supabaseHeaders(serviceKey),
    "content-type": "application/json"
  };

  const lookup = await fetch(`${url}/rest/v1/video_submissions?select=id,storage_bucket,storage_path,owner_delete_token&id=eq.${encodeURIComponent(id)}&limit=1`, {
    headers
  });
  const parsedLookup = await safeJsonResponse(lookup, "Supabase did not return JSON while finding the video.");
  const rows = parsedLookup.data || [];
  if (!lookup.ok) return json(lookup.status, { code: parsedLookup.error?.code || "VIDEO_LOOKUP_FAILED", message: rows?.message || parsedLookup.error?.message || "Could not find video." });

  const submission = rows[0];
  if (!submission) return json(404, { error: "Video not found." });
  if (!submission.owner_delete_token || submission.owner_delete_token !== delete_token) {
    return json(403, { error: "This device does not have permission to delete that video." });
  }

  if (submission.storage_path) {
    await fetch(`${url}/storage/v1/object/${submission.storage_bucket || "clip-submissions"}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ prefixes: [submission.storage_path] })
    });
  }

  const response = await fetch(`${url}/rest/v1/video_submissions?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { ...headers, prefer: "return=representation" }
  });
  const parsed = await safeJsonResponse(response, "Supabase did not return JSON while deleting the video.");
  if (!response.ok) return json(response.status, { code: parsed.error?.code || "VIDEO_DELETE_FAILED", message: parsed.data?.message || parsed.error?.message || "Could not delete video." });

  return json(200, { deleted: true });
};
