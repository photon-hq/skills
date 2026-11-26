#!/usr/bin/env node
// Store a secret that a Photon command prints once, without showing it.
//
// Pipe a command's JSON output into this script. It reads the named field,
// writes KEY=value into an env file with mode 0600, and prints only
// "stored KEY in FILE". The value never reaches the terminal, a log or chat.
// Node.js 18 or newer, no dependencies.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const HELP = `Usage: <photon command> --json | node store-secret.mjs --field <path> --key <NAME> --file <env file>

Reads one JSON document on stdin (the output of a Photon CLI command run with
--json), takes the value at --field, and writes NAME=value into the env file.

  --field <path>   Dot path of the secret in the JSON, for example:
                     secret            photon project api-key create
                     signingSecret     photon project webhook create | rotate-secret
                     password          photon project platform voice profile outbound enable | rotate
                     value             photon org oauth-client secret create | rotate
                   A replay (photon operation replay) nests the same output under
                   "result"; the script looks there too.
  --key <NAME>     Variable name, for example PHOTON_API_KEY or PHOTON_WEBHOOK_SECRET.
  --file <path>    Env file to create or update, for example .env.local.
  -h, --help       Show this help.

Safety checks, before anything is written:
  - stdin must be a pipe, not a terminal;
  - the file must not be a symbolic link;
  - inside a Git repository, Git must ignore the file and must not track it.

Other lines in the file are kept; an existing NAME= line is replaced. The file
ends up with mode 0600. On success the only output is "stored NAME in FILE".
If the JSON holds {"error": {...}}, only error.code is printed.

Example:
  set -o pipefail
  photon project api-key create --project pho_prj_... --name my-agent \\
    --permission project:read --permission project:write \\
    --expires-at 2027-03-01T00:00:00Z --json \\
    | node store-secret.mjs --field secret --key PHOTON_API_KEY --file .env.local
`;

function fail(message, code = 1) {
  process.stderr.write(`store-secret: ${message}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      process.stdout.write(HELP);
      process.exit(0);
    }
    const match = /^--(field|key|file)(?:=(.*))?$/.exec(arg);
    if (!match) fail(`unknown argument ${JSON.stringify(arg)}; see --help`, 2);
    const value = match[2] ?? argv[++i];
    if (value === undefined || value === "") fail(`--${match[1]} needs a value`, 2);
    options[match[1]] = value;
  }
  for (const name of ["field", "key", "file"]) {
    if (!options[name]) fail(`--${name} is required; see --help`, 2);
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(options.key)) fail("--key must be a variable name such as PHOTON_API_KEY", 2);
  return options;
}

function readStdin() {
  if (process.stdin.isTTY) fail("pipe the command's --json output into this script; it does not read secrets typed at a terminal", 2);
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    fail("could not read stdin");
  }
}

function pick(object, dotPath) {
  let value = object;
  for (const part of dotPath.split(".")) {
    if (value === null || typeof value !== "object" || !(part in value)) return undefined;
    value = value[part];
  }
  return value;
}

function git(args, cwd) {
  try {
    execFileSync("git", args, { cwd, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function checkTarget(file) {
  let stat;
  try {
    stat = fs.lstatSync(file);
  } catch {
    stat = undefined; // a new file
  }
  if (stat?.isSymbolicLink()) fail(`${file} is a symbolic link; write to a regular file instead`);
  if (stat && !stat.isFile()) fail(`${file} is not a regular file`);

  const dir = path.dirname(path.resolve(file));
  if (!fs.existsSync(dir)) fail(`folder ${dir} does not exist`);
  if (!git(["rev-parse", "--is-inside-work-tree"], dir)) return; // not in a Git repository
  const name = path.basename(file);
  if (git(["ls-files", "--error-unmatch", "--", name], dir)) {
    fail(`Git tracks ${file}; untrack it (git rm --cached) or pick another file`);
  }
  if (!git(["check-ignore", "-q", "--", name], dir)) {
    fail(`Git does not ignore ${file}; add it to .gitignore first`);
  }
}

function formatValue(value) {
  if (/^[A-Za-z0-9_\-.:/+=@]+$/.test(value)) return value;
  if (!value.includes("'")) return `'${value}'`;
  if (!/["\\]/.test(value)) return `"${value}"`;
  // Env file parsers disagree on escapes, so don't guess. The CLI's operation
  // record can replay the output into another store (see --help).
  fail("the value mixes quote characters an env file can't hold unambiguously; nothing was written");
}

function writeEnv(file, key, value) {
  let lines = [];
  if (fs.existsSync(file)) {
    lines = fs.readFileSync(file, "utf8").split("\n");
    lines = lines.filter((line) => !new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`).test(line));
    while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  }
  lines.push(`${key}=${formatValue(value)}`);
  const content = `${lines.join("\n")}\n`;

  const temp = path.join(path.dirname(path.resolve(file)), `.${path.basename(file)}.${process.pid}.tmp`);
  try {
    fs.writeFileSync(temp, content, { mode: 0o600, flag: "wx" });
    fs.chmodSync(temp, 0o600);
    fs.renameSync(temp, file);
    fs.chmodSync(file, 0o600);
  } catch (error) {
    try {
      fs.unlinkSync(temp);
    } catch {}
    fail(`could not write ${file} (${error.code ?? "write failed"})`);
  }
}

const options = parseArgs(process.argv.slice(2));
const input = readStdin();
let output;
try {
  output = JSON.parse(input);
} catch {
  fail("stdin is not one JSON document; run the command with --json and set -o pipefail");
}
if (output && typeof output === "object" && output.error) {
  const code = typeof output.error.code === "string" ? output.error.code : "unknown";
  fail(`the command failed with ${code}; nothing was written`);
}

const value = pick(output, options.field) ?? pick(output, `result.${options.field}`);
if (typeof value !== "string" || value === "") {
  fail(`no string at "${options.field}" in the output; nothing was written`);
}
if (/[\r\n\0]/.test(value)) fail("the value contains a line break; nothing was written");

checkTarget(options.file);
writeEnv(options.file, options.key, value);
process.stdout.write(`stored ${options.key} in ${options.file}\n`);
