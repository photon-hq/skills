#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const canonicalTag = (tag) => String(tag).toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");
const tagOwners = {
  users: "skills/photon-api/spectrum-api/users.md",
  projects: "skills/photon-api/spectrum-api/projects.md",
  billing: "skills/photon-api/spectrum-api/billing.md",
  fusor: "skills/photon-api/spectrum-api/fusor.md",
  imessage: "skills/photon-api/spectrum-api/imessage.md",
  lines: "skills/photon-api/spectrum-api/lines.md",
  platforms: "skills/photon-api/spectrum-api/platforms.md",
  voice: "skills/photon-api/spectrum-api/voice.md",
  webhooks: "skills/photon-api/spectrum-api/webhooks.md",
  "whatsapp-business": "skills/photon-api/spectrum-api/whatsapp-business.md",
  slack: "skills/photon-api/spectrum-api/slack.md",
};
const ignoredTags = new Set(["default", "health", "authentication", "internal"]);

const response = await fetch("https://spectrum.photon.codes/openapi/json", {
  headers: { "user-agent": "photon-skills-openapi-check" },
  signal: AbortSignal.timeout(15_000),
});
if (!response.ok) throw new Error(`Spectrum OpenAPI returned HTTP ${response.status}`);
const spec = await response.json();

const operationsByTag = new Map();
for (const [apiPath, pathItem] of Object.entries(spec.paths ?? {})) {
  for (const [method, operation] of Object.entries(pathItem ?? {})) {
    if (!operation || typeof operation !== "object" || !Array.isArray(operation.tags)) continue;
    for (const rawTag of operation.tags) {
      const tag = canonicalTag(rawTag);
      const list = operationsByTag.get(tag) ?? [];
      list.push(`${method.toUpperCase()} ${apiPath}`);
      operationsByTag.set(tag, list);
    }
  }
}

const errors = [];
for (const [tag, operations] of operationsByTag) {
  if (ignoredTags.has(tag)) continue;
  const owner = tagOwners[tag];
  if (!owner) {
    errors.push(`Unmapped OpenAPI tag: ${tag} (${operations.length} operations)`);
    continue;
  }
  const text = await readFile(path.join(root, owner), "utf8");
  if (!text.includes(`openapi-tag: ${tag}`)) errors.push(`${owner}: missing openapi tag marker`);
  if (!/\b(GET|POST|PUT|PATCH|DELETE)\b/.test(text)) errors.push(`${owner}: no HTTP method guidance`);
  if (!/\/projects\/\{projectId\}|OpenAPI/.test(text)) errors.push(`${owner}: no project path or live OpenAPI guidance`);
  console.log(`${tag}: ${operations.length} operations -> ${owner}`);
  for (const operation of operations.sort()) console.log(`  ${operation}`);
}

for (const tag of Object.keys(tagOwners)) {
  if (!operationsByTag.has(tag)) errors.push(`Expected OpenAPI tag disappeared: ${tag}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log("Spectrum OpenAPI tag ownership: valid");
