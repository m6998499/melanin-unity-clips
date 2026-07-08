const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(body)
});

const cleanText = (value, maxLength) => String(value || "").trim().slice(0, maxLength);
const isEmail = (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value || "");

async function insertSubmission(url, serviceKey, payload, includeDeleteToken) {
  const body = { ...payload };
  if (!includeDeleteToken) delete body.owner_delete_token;

  const response = await fetch(`${url}/rest/v1/video_submissions`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      "content-type": "application/json",
      prefer: "return=representation"
    },
    body: JSON.stringify(body)
  });

  const result = await response.json();
  return { response, result };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return json(500, { error: "Missing Supabase environment variables." });

  const payload = JSON.parse(event.body || "{}");
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

  if (!isEmail(uploaderEmail)) return json(400, { error: "Enter a valid email address." });
  if (title.length < 2) return json(400, { error: "Enter a title with at least 2 characters." });
  if (!storagePath || !storagePath.startsWith("pending/")) return json(400, { error: "Invalid upload path." });
  if (!["clip-submissions", "clip-submissions-v2"].includes(storageBucket)) return json(400, { error: "Invalid upload bucket." });

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

  if (!response.ok) return json(response.status, { error: result?.message || "Could not save submission." });
  return json(200, { submission: result[0], canSelfDelete });
};
