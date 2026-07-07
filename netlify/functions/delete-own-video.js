const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(body)
});

const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || "");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return json(500, { error: "Missing Supabase environment variables." });

  const { id, delete_token } = JSON.parse(event.body || "{}");
  if (!isUuid(id) || !isUuid(delete_token)) return json(400, { error: "Invalid delete request." });

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    "content-type": "application/json"
  };

  const lookup = await fetch(`${url}/rest/v1/video_submissions?select=id,storage_bucket,storage_path,owner_delete_token&id=eq.${encodeURIComponent(id)}&limit=1`, {
    headers
  });
  const rows = await lookup.json();
  if (!lookup.ok) return json(lookup.status, { error: rows?.message || "Could not find video." });

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
  const deleted = await response.json();
  if (!response.ok) return json(response.status, { error: deleted?.message || "Could not delete video." });

  return json(200, { deleted: true });
};
