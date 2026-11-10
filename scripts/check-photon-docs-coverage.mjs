#!/usr/bin/env node
import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const coverage = JSON.parse(await readFile(path.join(root, "docs/photon-docs-coverage.json"), "utf8"));
const normalize = (value) => value.split("#", 1)[0].replace(/\/+$/, "") || "/";

const currentPaths = new Set();
const response = await fetch("https://photon.codes/docs/llms.txt", {
  headers: { "user-agent": "photon-skills-doc-coverage" },
  signal: AbortSignal.timeout(15_000),
});
if (!response.ok) throw new Error(`Photon docs index returned HTTP ${response.status}`);
const index = await response.text();
for (const match of index.matchAll(/https:\/\/photon\.codes(\/docs\/[^\s)\]"'<>]+)/g)) {
  const value = normalize(match[1]);
  if (!/\/docs\/llms(?:-[^/]+)?(?:-full)?\.txt$/.test(value)) currentPaths.add(value);
}

const mappedCurrent = new Set(coverage.filter((entry) => entry.status === "covered" && entry.documentationPath.startsWith("/docs/")).map((entry) => normalize(entry.documentationPath)));
const unmapped = [...currentPaths].filter((item) => !mappedCurrent.has(item)).sort();
const stale = [...mappedCurrent].filter((item) => !currentPaths.has(item)).sort();
const missingOwners = [];
for (const entry of coverage) {
  try { await access(path.join(root, entry.owner)); }
  catch { missingOwners.push(`${entry.documentationPath} -> ${entry.owner}`); }
}

const ownerByPath = new Map();
const duplicates = [];
for (const entry of coverage) {
  const key = normalize(entry.documentationPath);
  if (ownerByPath.has(key) && ownerByPath.get(key) !== entry.owner) duplicates.push(`${key}: ${ownerByPath.get(key)} <> ${entry.owner}`);
  ownerByPath.set(key, entry.owner);
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const current = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(current));
    else out.push(current);
  }
  return out;
}

const skillDirs = await readdir(path.join(root, "skills"), { withFileTypes: true });
const structureErrors = [];
for (const dir of skillDirs.filter((entry) => entry.isDirectory())) {
  const skillPath = path.join(root, "skills", dir.name, "SKILL.md");
  try {
    const text = await readFile(skillPath, "utf8");
    const front = text.match(/^---\n([\s\S]*?)\n---/);
    if (!front) throw new Error("missing YAML frontmatter");
    const name = front[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
    const license = front[1].match(/^license:\s*(.+)$/m)?.[1]?.trim();
    const author = front[1].match(/^\s*author:\s*(.+)$/m)?.[1]?.trim();
    const version = front[1].match(/^\s*version:\s*['\"]?([^'\"\n]+)['\"]?$/m)?.[1]?.trim();
    if (name !== dir.name) structureErrors.push(`${dir.name}: name is ${name ?? "missing"}`);
    if (license !== "MIT") structureErrors.push(`${dir.name}: license is ${license ?? "missing"}`);
    if (!author) structureErrors.push(`${dir.name}: author missing`);
    if (!version) structureErrors.push(`${dir.name}: version missing`);
  } catch (error) { structureErrors.push(`${dir.name}: ${error.message}`); }
}

const allFiles = await walk(path.join(root, "skills"));
const markdown = allFiles.filter((file) => file.endsWith(".md"));
const contentErrors = [];
const substantiveRoots = [
  "skills/imessage/advanced/",
  "skills/whatsapp-business/",
  "skills/spectrum/content/",
  "skills/spectrum/providers/imessage/",
  "skills/photon-api/spectrum-api/",
  "skills/photon-webhooks/",
];
for (const file of markdown) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const text = await readFile(file, "utf8");
  const words = text.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  if (substantiveRoots.some((prefix) => relative.startsWith(prefix)) && words < 50) {
    contentErrors.push(`${relative}: only ${words} prose words`);
  }
  if (/\b(?:Cover|Include):\s*$/m.test(text) || /belongs here\.?$/m.test(text) || /For every request, consult the current OpenAPI and record:/i.test(text)) {
    contentErrors.push(`${relative}: placeholder instruction language remains`);
  }
}

const staleErrors = [];
const legacyPackageRoutingFiles = new Set([
  "skills/imessage/SKILL.md",
  "skills/imessage/legacy-advanced-imessage-kit.md",
]);
for (const file of markdown) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const text = await readFile(file, "utf8");
  if (relative.startsWith("skills/photon-cli/") && /(projects secret|get-secret|DASHBOARD_TOKEN|--platforms\b|--template\b|--observability\b)/.test(text)) staleErrors.push(`${relative}: stale CLI string`);
  if (text.includes("@photon-ai/advanced-imessage-kit") && !legacyPackageRoutingFiles.has(relative)) staleErrors.push(`${relative}: legacy package outside the canonical router or compatibility file`);
  if (/handleWebhook\(request\).*not supported/is.test(text)) staleErrors.push(`${relative}: obsolete Chat SDK webhook claim`);
}

const requiredMarkers = {
  "skills/imessage/advanced/messages.md": ["sendText(", "sendAttachment(", "subscribeEvents("],
  "skills/imessage/advanced/groups.md": ["setDisplayName(", "addParticipants(", "setIcon("],
  "skills/whatsapp-business/templates.md": ["template(", "urlButton("],
  "skills/photon-webhooks/verifying-signatures.md": ["Node / Express", "Bun / Hono", "Python / FastAPI", "Go / net/http"],
  "skills/spectrum/content/app-cards.md": ["app(", "miniAppCardSession"],
};
for (const [relative, markers] of Object.entries(requiredMarkers)) {
  const text = await readFile(path.join(root, relative), "utf8");
  for (const marker of markers) if (!text.includes(marker)) contentErrors.push(`${relative}: missing ${marker}`);
}

console.log(`Unmapped current Photon documentation pages: ${unmapped.length}`);
console.log(`Mapped files that do not exist: ${missingOwners.length}`);
console.log(`Unapproved duplicate owners: ${duplicates.length}`);
console.log(`Stale current-page mappings: ${stale.length}`);
console.log(`Invalid skill structures: ${structureErrors.length}`);
console.log(`Substantive-content errors: ${contentErrors.length}`);
console.log(`Stale-string errors: ${staleErrors.length}`);

for (const [label, values] of [
  ["Unmapped", unmapped], ["Missing owners", missingOwners], ["Duplicate owners", duplicates],
  ["Stale mappings", stale], ["Structure errors", structureErrors], ["Content errors", contentErrors], ["Stale strings", staleErrors],
]) if (values.length) {
  console.error(`\n${label}:`);
  for (const value of values) console.error(`- ${value}`);
}

if ([unmapped, missingOwners, duplicates, stale, structureErrors, contentErrors, staleErrors].some((items) => items.length)) process.exit(1);
