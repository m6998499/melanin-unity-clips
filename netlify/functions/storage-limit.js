const { corsPreflight, json, requireSupabaseEnv, safeJsonResponse, supabaseHeaders } = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return corsPreflight();
  const env = requireSupabaseEnv();
  if (env.error) return env.error;
  const { url, serviceKey } = env;

  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "clip-submissions";
  const response = await fetch(`${url}/storage/v1/bucket/${bucketName}`, {
    headers: supabaseHeaders(serviceKey)
  });
  const parsed = await safeJsonResponse(response, "Supabase did not return JSON while checking the storage bucket.");
  const bucket = parsed.data;
  if (!response.ok) return json(response.status, { code: parsed.error?.code || "BUCKET_READ_FAILED", message: bucket?.message || parsed.error?.message || "Could not read storage bucket." });

  const rawLimit = bucket?.file_size_limit || bucket?.fileSizeLimit || bucket?.file_size_limit_bytes || null;
  return json(200, {
    bucket,
    rawLimit,
    limitMb: rawLimit ? Number((rawLimit / 1024 / 1024).toFixed(2)) : null,
    limitGb: rawLimit ? Number((rawLimit / 1024 / 1024 / 1024).toFixed(2)) : null
  });
};
