const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(body)
});

exports.handler = async () => {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return json(500, { error: "Missing Supabase environment variables." });

  const response = await fetch(`${url}/storage/v1/bucket/clip-submissions`, {
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`
    }
  });
  const bucket = await response.json();
  if (!response.ok) return json(response.status, { error: bucket?.message || "Could not read storage bucket." });

  const rawLimit = bucket?.file_size_limit || bucket?.fileSizeLimit || bucket?.file_size_limit_bytes || null;
  return json(200, {
    bucket,
    rawLimit,
    limitMb: rawLimit ? Number((rawLimit / 1024 / 1024).toFixed(2)) : null,
    limitGb: rawLimit ? Number((rawLimit / 1024 / 1024 / 1024).toFixed(2)) : null
  });
};
