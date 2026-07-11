const FIVE_GB = 5 * 1024 * 1024 * 1024;

const {
  json,
  methodNotAllowed,
  requireSupabaseEnv,
  safeJsonResponse,
  supabaseHeaders,
  verifyAdmin
} = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return methodNotAllowed();
  const adminError = verifyAdmin(event);
  if (adminError) return adminError;

  const env = requireSupabaseEnv();
  if (env.error) return env.error;
  const { url, serviceKey } = env;
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "clip-submissions";

  const headers = {
    ...supabaseHeaders(serviceKey),
    "content-type": "application/json"
  };

  const currentResponse = await fetch(`${url}/storage/v1/bucket/${bucketName}`, { headers });
  const parsedCurrent = await safeJsonResponse(currentResponse, "Supabase did not return JSON while reading the storage bucket.");
  const current = parsedCurrent.data;
  if (!currentResponse.ok) return json(currentResponse.status, { code: parsedCurrent.error?.code || "BUCKET_READ_FAILED", message: current?.message || parsedCurrent.error?.message || "Could not read storage bucket." });

  const updateResponse = await fetch(`${url}/storage/v1/bucket/${bucketName}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      public: current.public || false,
      file_size_limit: FIVE_GB,
      allowed_mime_types: current.allowed_mime_types || ["video/mp4", "video/quicktime", "video/webm", "video/3gpp", "video/x-matroska"]
    })
  });
  const parsedUpdated = await safeJsonResponse(updateResponse, "Supabase did not return JSON while updating the storage bucket.");
  const updated = parsedUpdated.data;
  if (!updateResponse.ok) return json(updateResponse.status, { code: parsedUpdated.error?.code || "BUCKET_UPDATE_FAILED", message: updated?.message || parsedUpdated.error?.message || "Could not update storage bucket." });

  const verifyResponse = await fetch(`${url}/storage/v1/bucket/${bucketName}`, { headers });
  const parsedVerify = await safeJsonResponse(verifyResponse, "Supabase did not return JSON while verifying the storage bucket.");
  const verify = parsedVerify.data;
  const rawLimit = verify?.file_size_limit || verify?.fileSizeLimit || null;

  return json(200, {
    updated: true,
    bucket: verify,
    rawLimit,
    limitMb: rawLimit ? Number((rawLimit / 1024 / 1024).toFixed(2)) : null,
    limitGb: rawLimit ? Number((rawLimit / 1024 / 1024 / 1024).toFixed(2)) : null
  });
};
