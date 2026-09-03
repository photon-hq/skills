# Getting started

## What it is

`photon` (alias `pho`) is a typed terminal UI for the **Photon Dashboard**. Use it to authenticate, create and manage projects, handle billing, and manage Spectrum users, lines, platforms, profiles, and avatars without leaving the terminal.

Use the Spectrum SDK for runtime agent behavior and the Spectrum API for direct HTTPS management automation. The CLI is the interactive and scriptable control-plane surface.

## Agent quickstart

**Match the user's intent.** If they are adamant — "just set this up for me," "do it" — drive the safe workflow yourself: run the commands, read the JSON output, and report the project ID and verification result. Do not hand back a checklist or ask permission for every read-only step.

Everything is self-serve except **possibly** `photon login`, where a person approves the device request in a browser.

- **Already logged in?** Run `photon whoami --json`; if it names the expected user, continue without human involvement.
- **Not logged in?** Run `photon login --no-browser`, give the user the verification URL and code, and continue after approval.
- **Confirm first:** checkout, subscription changes, deletion, line removal, and project-secret rotation.

```bash
# 0. Install if needed.
photon --version || npm install -g @photon-ai/cli

# 1. Authenticate. Browser approval is the only possible human step here.
photon whoami --json || photon login --no-browser

# 2. Create a Spectrum project and capture its ID.
PROJECT_ID=$(photon projects create \
  --name "My App" \
  --location us-east \
  --spectrum \
  --json | jq -r '.id')
export PHOTON_PROJECT_ID="$PROJECT_ID"

# 3. Read back the project and its Spectrum state.
photon projects show --json
photon spectrum profile show --json
photon spectrum lines ls --json
```

**You're done when** the project can be read back and the requested Spectrum resources can be inspected. An empty line list does not necessarily mean failure: shared-line and dedicated-line plans expose different project-owned resources.

When application code needs project credentials, retrieve them through `photon projects show` or the project page in the Dashboard and put the secret in an ignored environment file or secret manager. Do not print it in the final response. `projects regenerate-secret` rotates the secret; it is not a read operation.

## Run without a global install

One-off runners download and execute the package directly:

```bash
npx @photon-ai/cli login
pnpx @photon-ai/cli projects ls

yarn dlx @photon-ai/cli whoami
bunx @photon-ai/cli projects ls --json
```

Use `@latest` when bypassing a stale package-manager cache matters:

```bash
npx @photon-ai/cli@latest --version
```

One-off runners do not create the `pho` shortcut because the package manager is already invoking the binary explicitly.

## Install globally

```bash
npm install -g @photon-ai/cli
# or: pnpm add -g @photon-ai/cli
# or: yarn global add @photon-ai/cli
# or: bun add -g @photon-ai/cli

photon --version
photon ping
```

After a global install, `photon` is the primary binary and `pho` is the shorthand alias.

## Standalone binaries

Prebuilt standalone binaries are published for macOS and Linux on `arm64` and `x64`, with matching checksum files. Verify the checksum before installing one. Standalone binaries do not require Node.js.

For the npm package, use Node.js 18 or later.

## Authenticate

```bash
photon login
```

The CLI uses a device-authorization flow:

1. It creates a verification URL and user code.
2. It opens the URL in the default browser, or prints it with `--no-browser`.
3. The user signs in and approves the request.
4. The CLI polls until approval and stores the access token for that backend.

```bash
photon login --no-browser
photon whoami
photon auth status --json
```

Credentials are stored per backend with file mode `600`. See [`environment.md`](./environment.md) for the exact directory and resolution order.

Do not ask the user for a Photon password. Do not paste a device token or credential file into chat.

## Create a project

Without flags, the CLI opens an interactive project flow:

```bash
photon projects create
```

For agent-driven or scripted setup, pass the fields directly:

```bash
photon projects create \
  --name "My App" \
  --location us-east \
  --spectrum \
  --json
```

The current project flags are:

| Flag | Meaning |
|---|---|
| `--name <name>` | Project name. |
| `--location <location>` | Deployment region accepted by the current CLI. |
| `--spectrum` | Enable Spectrum for the project. |
| `--json` | Return machine-readable output. |

Project creation itself does not start a paid checkout. A dedicated line is a separate plan and resource decision.

### Make it the active project

Most project-scoped commands resolve the project from `--project`, then `PHOTON_PROJECT_ID`:

```bash
export PHOTON_PROJECT_ID='proj_abc123'
photon projects show --json
photon spectrum users ls --json
```

Or target one command explicitly:

```bash
photon spectrum lines ls --project 'proj_abc123' --json
```

## Inspect Spectrum resources

```bash
photon spectrum profile show --json
photon spectrum users ls --json
photon spectrum lines ls --json
photon spectrum platforms ls --json
```

Inspect before mutating. Project creation, platform enablement, line allocation, and paid subscription state are separate operations.

## Update the CLI

- **One-off runner** — use `@latest` when cache freshness matters.
- **Global package** — run the package manager's global update command.
- **Standalone binary** — download the new release and verify its checksum again.
- **Update notifier** — set `PHOTON_NO_UPDATE_NOTIFIER=1` to disable it.

## Next

- Full command reference → [`commands.md`](./commands.md)
- Spectrum lines, users, platforms, profile, and avatar → [`spectrum.md`](./spectrum.md)
- End-to-end recipes → [`workflows.md`](./workflows.md)
- Environment and credentials → [`environment.md`](./environment.md)
