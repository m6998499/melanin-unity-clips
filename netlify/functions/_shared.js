const crypto = require("node:crypto");

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store"
};

const failedPinAttempts = new Map();

function json(statusCode, payload) {
  const success = statusCode >= 200 && statusCode < 300;
  const body = payload && Object.prototype.hasOwnProperty.call(payload, "success")
    ? payload
    : { success, ...(success ? payload : { error: normalizeError(payload) }) };

  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  };
}

function normalizeError(payload) {
  if (payload?.error?.code) return payload.error;
  if (typeof payload?.error === "string") {
    return { code: payload.code || "REQUEST_FAILED", message: payload.error };
  }
  if (typeof payload?.message === "string") {
    return { code: payload.code || "REQUEST_FAILED", message: payload.message };
  }
  return { code: "REQUEST_FAILED", message: "The request could not be completed." };
}

function methodNotAllowed() {
  return json(405, { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." });
}

function parseJsonBody(event) {
  try {
    return { payload: JSON.parse(event.body || "{}") };
  } catch {
    return { error: json(400, { code: "INVALID_JSON", message: "Request body must be valid JSON." }) };
  }
}

function requireSupabaseEnv() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return {
      error: json(500, {
        code: "MISSING_SUPABASE_ENV",
        message: "Supabase server configuration is missing."
      })
    };
  }
  return { url: url.replace(/\/+$/, ""), serviceKey };
}

async function safeJsonResponse(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      data: null,
      error: {
        code: "NON_JSON_RESPONSE",
        message: fallbackMessage || "The server returned a non-JSON response.",
        detail: text.slice(0, 180)
      }
    };
  }

  try {
    return { data: text ? JSON.parse(text) : null };
  } catch {
    return {
      data: null,
      error: {
        code: "INVALID_JSON_RESPONSE",
        message: fallbackMessage || "The server returned invalid JSON."
      }
    };
  }
}

function supabaseHeaders(serviceKey, extra = {}) {
  return {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    ...extra
  };
}

function requestKey(event) {
  return event.headers["x-nf-client-connection-ip"]
    || event.headers["client-ip"]
    || event.headers["x-forwarded-for"]?.split(",")[0]?.trim()
    || "unknown";
}

function isLocked(key) {
  const entry = failedPinAttempts.get(key);
  if (!entry) return false;
  if (entry.lockedUntil && entry.lockedUntil > Date.now()) return true;
  if (entry.lockedUntil && entry.lockedUntil <= Date.now()) failedPinAttempts.delete(key);
  return false;
}

function recordFailedPin(key) {
  const entry = failedPinAttempts.get(key) || { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= 5) {
    entry.lockedUntil = Date.now() + 15 * 60 * 1000;
  }
  failedPinAttempts.set(key, entry);
}

function clearFailedPin(key) {
  failedPinAttempts.delete(key);
}

function timingSafeEqualText(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function verifyHash(pin, encodedHash) {
  const parts = String(encodedHash || "").split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") return false;
  const iterations = Number(parts[1]);
  const salt = parts[2];
  const expected = parts[3];
  if (!Number.isInteger(iterations) || iterations < 100000 || !salt || !expected) return false;
  const actual = crypto.pbkdf2Sync(String(pin || ""), salt, iterations, 32, "sha256").toString("base64url");
  return timingSafeEqualText(actual, expected);
}

function hashPin(pin, salt = crypto.randomBytes(16).toString("base64url"), iterations = 310000) {
  const digest = crypto.pbkdf2Sync(String(pin || ""), salt, iterations, 32, "sha256").toString("base64url");
  return `pbkdf2_sha256$${iterations}$${salt}$${digest}`;
}

function verifyAdmin(event) {
  const key = requestKey(event);
  if (isLocked(key)) {
    return json(429, {
      code: "ADMIN_PIN_LOCKED",
      message: "Too many incorrect PIN attempts. Wait 15 minutes and try again."
    });
  }

  const pin = event.headers["x-admin-pin"];
  if (!pin) {
    recordFailedPin(key);
    return json(401, { code: "ADMIN_PIN_REQUIRED", message: "Enter the admin PIN." });
  }

  const hash = process.env.ADMIN_PIN_HASH;
  const legacyPin = process.env.ADMIN_PIN;
  const valid = hash ? verifyHash(pin, hash) : Boolean(legacyPin && timingSafeEqualText(pin, legacyPin));

  if (!valid) {
    recordFailedPin(key);
    return json(401, { code: "INVALID_ADMIN_PIN", message: "Invalid admin PIN." });
  }

  clearFailedPin(key);
  return null;
}

module.exports = {
  json,
  methodNotAllowed,
  parseJsonBody,
  requireSupabaseEnv,
  safeJsonResponse,
  supabaseHeaders,
  verifyAdmin,
  hashPin,
  verifyHash
};
