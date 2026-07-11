const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "outputs", "netlify-site");
const required = [
  "index.html",
  "supabase-config.js",
  "sw.js",
  "manifest.webmanifest",
  "privacy-policy.html"
];

for (const file of required) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing static site file: ${file}`);
  }
}

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const marker of [
  "/.netlify/functions/create-submission",
  "/.netlify/functions/list-submissions",
  "/.netlify/functions/public-feed",
  "fetchJson",
  "detectVideoType"
]) {
  if (!index.includes(marker)) {
    throw new Error(`Static site is missing expected marker: ${marker}`);
  }
}

console.log("Static Netlify site assets verified.");
