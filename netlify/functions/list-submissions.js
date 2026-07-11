const { corsPreflight, json, requireSupabaseEnv, safeJsonResponse, supabaseHeaders, verifyAdmin } = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return corsPreflight();
  const adminError = verifyAdmin(event);
  if (adminError) return adminError;

  const env = requireSupabaseEnv();
  if (env.error) return env.error;
  const { url, serviceKey } = env;

  const response = await fetch(`${url}/rest/v1/video_submissions?select=*&order=created_at.desc`, {
    headers: supabaseHeaders(serviceKey)
  });
  const parsed = await safeJsonResponse(response, "Supabase did not return JSON while loading submissions.");
  if (!response.ok) {
    return json(response.status, {
      code: parsed.error?.code || "SUBMISSIONS_LOAD_FAILED",
      message: parsed.data?.message || parsed.error?.message || "Could not load submissions."
    });
  }

  return json(200, { submissions: parsed.data || [] });
};
