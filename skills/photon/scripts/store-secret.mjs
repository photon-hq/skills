#!/usr/bin/env node
// Store a secret that a Photon command prints once, without showing it.
//
// Pipe a command's JSON output into this script. It reads the named field,
// writes KEY=value into an env file with mode 0600, and prints only
// "stored KEY in FILE". The value never reaches the terminal, a log or chat.
// Node.js 18 or newer, no dependencies.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const HELP = `Usage: <photon command> --json | node store-secret.mjs --field <path> --key <NAME> --file <env file>
       node store-secret.mjs --check --file <env file>

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
  --check          Only run the safety checks on --file and read nothing. Run it
                   before the command that prints the secret, so a refusal
                   doesn't cost the secret.
  -h, --help       Show this help.

Safety checks, before anything is written:
  - stdin must be a pipe, not a terminal;
  - the file must not be a symbolic link;
  - inside a Git repository, Git must ignore the file and must not track it;
  - if Git can't answer (not installed, an error), nothing is written.

Other lines in the file are kept; an existing NAME= line is replaced. The file
ends up with mode 0600. On success the only output is "stored NAME in FILE".
If the JSON holds {"error": {...}}, only error.code is printed. Run one store
at a time per file.

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
    if (arg === "--check") {
      options.check = true;
      continue;
    }
    const match = /^--(field|key|file)(?:=(.*))?$/.exec(arg);
    if (!match) fail(`unknown argument ${JSON.stringify(arg)}; see --help`, 2);
    const value = match[2] ?? argv[++i];
    if (value === undefined || value === "") fail(`--${match[1]} needs a value`, 2);
    options[match[1]] = value;
  }
  for (const name of options.check ? ["file"] : ["field", "key", "file"]) {
    if (!options[name]) fail(`--${name} is required; see --help`, 2);
  }
  if (options.check) return options;
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

// Runs git and returns its exit status and stderr (in English, to read it).
// Stops when git can't run at all, since then nothing is known.
function git(args, cwd) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    // GIT_DIR and friends would point git at another repository than the file's.
    env: { ...Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_"))), LC_ALL: "C", LANGUAGE: "C" },
  });
  if (result.error) {
    if (result.error.code === "ENOENT" && !insideGitFolder(cwd)) return { status: 128, stderr: "not a git repository" };
    fail(`could not run git to check the file (${result.error.code ?? "error"}); nothing was written`);
  }
  return { status: result.status, stderr: result.stderr ?? "", stdout: result.stdout ?? "" };
}

// Without git installed: refuse when any parent folder has a .git entry.
function insideGitFolder(dir) {
  for (let current = path.resolve(dir); ; current = path.dirname(current)) {
    if (fs.existsSync(path.join(current, ".git"))) return true;
    if (path.dirname(current) === current) return false;
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
  const inside = git(["rev-parse", "--is-inside-work-tree"], dir);
  if (inside.status !== 0) {
    if (/not a git repository/i.test(inside.stderr)) return null; // confirmed: not in a Git repository
    fail(`Git could not inspect ${dir}; nothing was written`);
  }
  if (inside.stdout.trim() !== "true") fail(`${dir} is not inside a Git work tree (a .git folder?); pick another file`);
  const name = path.basename(file);
  const tracked = git(["ls-files", "--error-unmatch", "--", name], dir);
  if (tracked.status === 0) fail(`Git tracks ${file}; untrack it (git rm --cached) or pick another file`);
  if (!/did not match/i.test(tracked.stderr)) fail(`Git could not check whether it tracks ${file}; nothing was written`);
  const ignored = git(["check-ignore", "-q", "--", name], dir);
  if (ignored.status === 1) fail(`Git does not ignore ${file}; add it to .gitignore first`);
  if (ignored.status !== 0) fail(`Git could not check whether it ignores ${file}; nothing was written`);
  // Git never stages anything inside its own folder, so the temporary file goes there.
  const gitDir = git(["rev-parse", "--absolute-git-dir"], dir);
  if (gitDir.status !== 0 || !gitDir.stdout.trim()) fail(`Git could not name its folder for ${dir}; nothing was written`);
  return gitDir.stdout.trim();
}

function formatValue(value) {
  if (/^[A-Za-z0-9_\-.:/+=@]+$/.test(value)) return value;
  if (!value.includes("'")) return `'${value}'`;
  if (!/["\\]/.test(value)) return `"${value}"`;
  // Env file parsers disagree on escapes, so don't guess. The CLI's operation
  // record can replay the output into another store (see --help).
  fail("the value mixes quote characters an env file can't hold unambiguously; nothing was written");
}

function writeEnv(file, key, value, tempDir) {
  let lines = [];
  if (fs.existsSync(file)) {
    lines = fs.readFileSync(file, "utf8").split("\n");
    lines = lines.filter((line) => !new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`).test(line));
    while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  }
  lines.push(`${key}=${formatValue(value)}`);
  const content = `${lines.join("\n")}\n`;

  // Outside Git the temporary file sits beside the target; inside, in Git's
  // own folder, which Git never stages.
  const temp = path.join(tempDir ?? path.dirname(path.resolve(file)), `.${path.basename(file)}.${process.pid}.tmp`);
  try {
    fs.writeFileSync(temp, content, { mode: 0o600, flag: "wx" });
    fs.chmodSync(temp, 0o600);
    try {
      fs.renameSync(temp, file);
    } catch (error) {
      if (error.code !== "EXDEV") throw error;
      // Git's folder is on another file system: write the checked file in place.
      if (fs.existsSync(file)) fs.chmodSync(file, 0o600);
      fs.writeFileSync(file, content, { mode: 0o600 });
      fs.unlinkSync(temp);
    }
    fs.chmodSync(file, 0o600);
  } catch (error) {
    try {
      fs.unlinkSync(temp);
    } catch {}
    fail(`could not write ${file} (${error.code ?? "write failed"})`);
  }
}

const options = parseArgs(process.argv.slice(2));
const tempDir = checkTarget(options.file);
if (options.check) {
  process.stdout.write(`${options.file} can hold secrets\n`);
  process.exit(0);
}
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

writeEnv(options.file, options.key, value, tempDir);
process.stdout.write(`stored ${options.key} in ${options.file}\n`);
