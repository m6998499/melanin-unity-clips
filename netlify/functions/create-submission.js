const {
  json,
  methodNotAllowed,
  parseJsonBody,
  requireSupabaseEnv,
  safeJsonResponse,
  supabaseHeaders
} = require("./_shared");

const cleanText = (value, maxLength) => String(value || "").trim().slice(0, maxLength);
const isEmail = (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value || "");
const allowedBuckets = new Set(["clip-submissions"]);
const allowedTypes = new Set(["video/mp4", "video/quicktime", "video/webm", "video/3gpp", "video/x-matroska"]);
const maxUploadBytes = Number(process.env.MAX_UPLOAD_BYTES || 50 * 1024 * 1024);

async function insertSubmission(url, serviceKey, payload, includeDeleteToken) {
  const body = { ...payload };
  if (!includeDeleteToken) delete body.owner_delete_token;

  const response = await fetch(`${url}/rest/v1/video_submissions`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(serviceKey),
      "content-type": "application/json",
      prefer: "return=representation"
    },
    body: JSON.stringify(body)
  });

  const parsed = await safeJsonResponse(response, "Supabase did not return JSON while saving the upload.");
  const result = parsed.data || parsed.error;
  return { response, result };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return methodNotAllowed();

  const env = requireSupabaseEnv();
  if (env.error) return env.error;
  const { url, serviceKey } = env;

  const parsedBody = parseJsonBody(event);
  if (parsedBody.error) return parsedBody.error;
  const payload = parsedBody.payload;
  const uploaderEmail = cleanText(payload.uploader_email, 160);
  const title = cleanText(payload.title, 120);
  const caption = cleanText(payload.caption, 1000);
  const category = cleanText(payload.category, 80) || "Community";
  const storageBucket = cleanText(payload.storage_bucket, 80) || "clip-submissions";
  const storagePath = cleanText(payload.storage_path, 500);
  const originalFilename = cleanText(payload.original_filename, 180);
  const fileType = cleanText(payload.file_type, 80);
  const fileSize = Number(payload.file_size || 0);
  const ownerDeleteToken = cleanText(payload.owner_delete_token, 80);

  if (!isEmail(uploaderEmail)) return json(400, { code: "INVALID_EMAIL", message: "Enter a valid email address." });
  if (title.length < 2) return json(400, { code: "INVALID_TITLE", message: "Enter a title with at least 2 characters." });
  if (!storagePath || !storagePath.startsWith("pending/")) return json(400, { code: "INVALID_STORAGE_PATH", message: "Invalid upload path." });
  if (!allowedBuckets.has(storageBucket)) return json(400, { code: "INVALID_BUCKET", message: "Invalid upload bucket." });
  if (!allowedTypes.has(fileType)) return json(400, { code: "UNSUPPORTED_VIDEO_TYPE", message: "Use MP4, MOV, WebM, 3GP, or compatible MKV video." });
  if (!Number.isFinite(fileSize) || fileSize <= 0) return json(400, { code: "INVALID_FILE_SIZE", message: "The uploaded file size is missing." });
  if (fileSize > maxUploadBytes) return json(413, { code: "UPLOAD_TOO_LARGE", message: "The selected video exceeds the current upload limit." });

  const submission = {
    uploader_email: uploaderEmail,
    title,
    caption,
    category,
    storage_bucket: storageBucket,
    storage_path: storagePath,
    original_filename: originalFilename,
    file_type: fileType,
    file_size: fileSize,
    owner_delete_token: ownerDeleteToken || null,
    status: "pending_review"
  };

  let { response, result } = await insertSubmission(url, serviceKey, submission, true);
  let canSelfDelete = true;

  if (!response.ok && String(result?.message || "").includes("owner_delete_token")) {
    ({ response, result } = await insertSubmission(url, serviceKey, submission, false));
    canSelfDelete = false;
  }

  if (!response.ok) return json(response.status, { code: result?.code || "SUBMISSION_SAVE_FAILED", message: result?.message || "Could not save submission." });
  return json(200, { submission: result[0], canSelfDelete });
};
