exports.handler = async () => {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Missing Supabase environment variables." }) };
  }

  const submissionsResponse = await fetch(
    `${url}/rest/v1/video_submissions?select=id,title,caption,category,storage_bucket,storage_path,created_at&status=eq.published&order=reviewed_at.desc&limit=25`,
    {
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`
      }
    }
  );

  if (!submissionsResponse.ok) {
    return { statusCode: submissionsResponse.status, body: await submissionsResponse.text() };
  }

  const submissions = await submissionsResponse.json();
  const clips = [];

  for (const item of submissions) {
    const bucket = item.storage_bucket || "clip-submissions";
    const objectPath = encodeURI(item.storage_path).replace(/#/g, "%23");
    const signedResponse = await fetch(`${url}/storage/v1/object/sign/${bucket}/${objectPath}`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ expiresIn: 3600 })
    });

    if (!signedResponse.ok) continue;
    const signed = await signedResponse.json();
    clips.push({
      id: item.id,
      title: item.title || "Community Clip",
      caption: item.caption || "",
      category: item.category || "Community",
      videoUrl: `${url}/storage/v1${signed.signedURL}`
    });
  }

  return {
    statusCode: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
    body: JSON.stringify({ clips })
  };
};
