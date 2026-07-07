const FIVE_GB = 5 * 1024 * 1024 * 1024;

const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });
  if (event.headers["x-admin-pin"] !== process.env.ADMIN_PIN) {
    return json(401, { error: "Invalid admin PIN." });
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return json(500, { error: "Missing Supabase environment variables." });

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    "content-type": "application/json"
  };

  const currentResponse = await fetch(`${url}/storage/v1/bucket/clip-submissions-v2`, { headers });
  const current = await currentResponse.json();
  if (!currentResponse.ok) return json(currentResponse.status, { error: current?.message || "Could not read storage bucket." });

  const updateResponse = await fetch(`${url}/storage/v1/bucket/clip-submissions-v2`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      public: current.public || false,
      file_size_limit: FIVE_GB,
      allowed_mime_types: current.allowed_mime_types || ["video/mp4", "video/quicktime", "video/webm"]
    })
  });
  const updated = await updateResponse.json();
  if (!updateResponse.ok) return json(updateResponse.status, { error: updated?.message || "Could not update storage bucket.", details: updated });

  const verifyResponse = await fetch(`${url}/storage/v1/bucket/clip-submissions-v2`, { headers });
  const verify = await verifyResponse.json();
  const rawLimit = verify?.file_size_limit || verify?.fileSizeLimit || null;

  return json(200, {
    updated: true,
    bucket: verify,
    rawLimit,
    limitMb: rawLimit ? Number((rawLimit / 1024 / 1024).toFixed(2)) : null,
    limitGb: rawLimit ? Number((rawLimit / 1024 / 1024 / 1024).toFixed(2)) : null
  });
};
