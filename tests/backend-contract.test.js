const test = require("node:test");
const assert = require("node:assert/strict");
const {
  hashPin,
  safeJsonResponse,
  verifyAdmin,
  verifyHash
} = require("../netlify/functions/_shared");

function adminEvent(pin, ip = "127.0.0.1") {
  return {
    headers: {
      "x-admin-pin": pin,
      "x-nf-client-connection-ip": ip
    }
  };
}

test("hashed admin PIN accepts the correct PIN", () => {
  const previousHash = process.env.ADMIN_PIN_HASH;
  const previousPin = process.env.ADMIN_PIN;
  process.env.ADMIN_PIN_HASH = hashPin("2468", "test-salt", 310000);
  delete process.env.ADMIN_PIN;

  assert.equal(verifyHash("2468", process.env.ADMIN_PIN_HASH), true);
  assert.equal(verifyAdmin(adminEvent("2468")), null);

  if (previousHash === undefined) delete process.env.ADMIN_PIN_HASH;
  else process.env.ADMIN_PIN_HASH = previousHash;
  if (previousPin === undefined) delete process.env.ADMIN_PIN;
  else process.env.ADMIN_PIN = previousPin;
});

test("missing admin PIN returns JSON error", () => {
  const result = verifyAdmin({ headers: { "x-nf-client-connection-ip": "missing-pin-test" } });
  assert.equal(result.statusCode, 401);
  assert.match(result.headers["content-type"], /application\/json/);
  assert.equal(JSON.parse(result.body).error.code, "ADMIN_PIN_REQUIRED");
});

test("repeated bad admin PIN attempts lock the client temporarily", () => {
  const previousHash = process.env.ADMIN_PIN_HASH;
  process.env.ADMIN_PIN_HASH = hashPin("2468", "lockout-salt", 310000);
  const ip = "lockout-test";

  for (let i = 0; i < 5; i += 1) verifyAdmin(adminEvent("wrong", ip));
  const result = verifyAdmin(adminEvent("wrong", ip));

  assert.equal(result.statusCode, 429);
  assert.equal(JSON.parse(result.body).error.code, "ADMIN_PIN_LOCKED");

  if (previousHash === undefined) delete process.env.ADMIN_PIN_HASH;
  else process.env.ADMIN_PIN_HASH = previousHash;
});

test("safeJsonResponse detects an HTML page before JSON parsing", async () => {
  const response = new Response("<!doctype html><title>Not found</title>", {
    status: 404,
    headers: { "content-type": "text/html" }
  });

  const parsed = await safeJsonResponse(response, "Expected JSON.");

  assert.equal(parsed.data, null);
  assert.equal(parsed.error.code, "NON_JSON_RESPONSE");
  assert.match(parsed.error.detail, /doctype html/i);
});
