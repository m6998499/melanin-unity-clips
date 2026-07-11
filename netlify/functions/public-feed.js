const { json, requireSupabaseEnv, safeJsonResponse, supabaseHeaders } = require("./_shared");

exports.handler = async () => {
  const env = requireSupabaseEnv();
  if (env.error) return env.error;
  const { url, serviceKey } = env;

  const submissionsResponse = await fetch(
    `${url}/rest/v1/video_submissions?select=id,title,caption,category,storage_bucket,storage_path,created_at&status=eq.published&order=reviewed_at.desc&limit=25`,
    {
      headers: supabaseHeaders(serviceKey)
    }
  );

  const parsedSubmissions = await safeJsonResponse(submissionsResponse, "Supabase did not return JSON while loading the feed.");
  if (!submissionsResponse.ok) {
    return json(submissionsResponse.status, {
      code: parsedSubmissions.error?.code || "FEED_LOAD_FAILED",
      message: parsedSubmissions.data?.message || parsedSubmissions.error?.message || "Could not load the video feed."
    });
  }

  const submissions = parsedSubmissions.data || [];
  const clips = [];

  for (const item of submissions) {
    const bucket = item.storage_bucket || "clip-submissions";
    const objectPath = encodeURI(item.storage_path).replace(/#/g, "%23");
    const signedResponse = await fetch(`${url}/storage/v1/object/sign/${bucket}/${objectPath}`, {
      method: "POST",
      headers: {
        ...supabaseHeaders(serviceKey),
        "content-type": "application/json"
      },
      body: JSON.stringify({ expiresIn: 3600 })
    });

    if (!signedResponse.ok) continue;
    const parsedSigned = await safeJsonResponse(signedResponse, "Supabase did not return JSON while signing a video URL.");
    if (!parsedSigned.data?.signedURL) continue;
    clips.push({
      id: item.id,
      title: item.title || "Community Clip",
      caption: item.caption || "",
      category: item.category || "Community",
      videoUrl: `${url}/storage/v1${parsedSigned.data.signedURL}`
    });
  }

  return json(200, { clips });
};
