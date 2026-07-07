exports.handler = async (event) => {
  if (event.headers["x-admin-pin"] !== process.env.ADMIN_PIN) {
    return { statusCode: 401, body: JSON.stringify({ error: "Invalid admin PIN." }) };
  }

  const { id, status } = JSON.parse(event.body || "{}");
  if (!id || !["published", "rejected", "removed", "deleted"].includes(status)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid moderation request." }) };
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Missing Supabase environment variables." }) };
  }

  const baseHeaders = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`
  };

  if (status === "deleted") {
    const lookup = await fetch(`${url}/rest/v1/video_submissions?select=id,storage_bucket,storage_path&id=eq.${encodeURIComponent(id)}&limit=1`, {
      headers: baseHeaders
    });
    const rows = await lookup.json();
    if (!lookup.ok) {
      return { statusCode: lookup.status, body: JSON.stringify({ error: rows?.message || "Could not find submission." }) };
    }

    const submission = rows[0];
    if (!submission) {
      return { statusCode: 404, body: JSON.stringify({ error: "Submission not found." }) };
    }

    if (submission.storage_path) {
      await fetch(`${url}/storage/v1/object/${submission.storage_bucket || "clip-submissions"}`, {
        method: "DELETE",
        headers: {
          ...baseHeaders,
          "content-type": "application/json"
        },
        body: JSON.stringify({ prefixes: [submission.storage_path] })
      });
    }

    const deleteResponse = await fetch(`${url}/rest/v1/video_submissions?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        ...baseHeaders,
        prefer: "return=representation"
      }
    });
    const deleted = await deleteResponse.json();
    return { statusCode: deleteResponse.status, body: JSON.stringify({ result: deleted }) };
  }

  const response = await fetch(`${url}/rest/v1/video_submissions?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      ...baseHeaders,
      "content-type": "application/json",
      prefer: "return=representation"
    },
    body: JSON.stringify({ status, reviewed_at: new Date().toISOString() })
  });
  const result = await response.json();
  return { statusCode: response.status, body: JSON.stringify({ result }) };
};
