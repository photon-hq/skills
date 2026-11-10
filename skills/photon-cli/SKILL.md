---
name: photon-cli
description: >
  Use when working with the Photon CLI — the `photon` binary (alias `pho`). Reach for this skill to set up or
  bootstrap Photon for a user and run the safe steps yourself non-interactively: install the CLI, authenticate,
  create or inspect a project, capture machine-readable output, and verify Spectrum resources. Also covers login,
  logout, whoami, auth status, projects, deliberate Spectrum secret rotation, billing, profiles, lines, users,
  platforms, avatars, JSON output, CI tokens, multiple backends, and environment resolution. When the user says
  "set this up for me," drive the workflow instead of handing back commands, except for browser approval and actions
  that spend money, delete resources, remove lines, or rotate credentials.
license: MIT
metadata:
  author: photon-hq
  version: '2.0.0'
---

# Photon CLI

`photon` (alias `pho`) is a typed terminal UI for the **Photon Dashboard**. Use it to authenticate, create and manage projects, handle billing, and manage Spectrum resources — all from the command line.

The CLI can run globally or through `npx`, `pnpx`, `yarn dlx`, or `bunx`. Use `--json` where available for machine-readable output and resolve the target backend, token, and project from command flags or environment variables. See [`environment.md`](./environment.md) for the exact precedence rules.

```bash
npx @photon-ai/cli login              # one-off runner
photon projects ls --json             # global install
photon spectrum lines ls --json       # project-scoped resource
```

## Setting it up? Read the room, then act

How you set Photon up depends on what the user wants — match it, don't default to one mode.

- **User is adamant / "just set this up for me" / "do it"** → **drive the safe workflow end to end.** Run the [happy-path block](#happy-path-set-up-a-project-yourself), read the JSON output, and report the project ID and verification result. Do not hand back a checklist or ask permission for routine read-only steps.
- **User is exploring / wants to learn / is ambivalent** → walk them through the commands and pause at meaningful decisions such as choosing a project or a paid plan.
- **Genuinely needs a human:** browser approval for `login`, plus confirmation for checkout, subscription changes, deletion, line removal, or secret rotation. Surface exactly what is needed, then continue with the remaining safe work.

### Happy path: set up a project yourself

Use plain, non-interactive commands and capture structured output. Do not print project secrets in the final response or commit them to the repository.

```bash
# 0. Install if needed.
photon --version || npm install -g @photon-ai/cli

# 1. Check authentication. Login is the only step that may require browser approval.
photon whoami --json || photon login --no-browser

# 2. Create a Spectrum project on the free path and capture its ID.
PROJECT_ID=$(photon projects create \
  --name "My App" \
  --location us-east \
  --spectrum \
  --json | jq -r '.id')
export PHOTON_PROJECT_ID="$PROJECT_ID"

# 3. Inspect and verify the project and its Spectrum resources.
photon projects show --json
photon spectrum profile show --json
photon spectrum lines ls --json
```

**You're done when** the project can be read back and the requested Spectrum resources can be inspected. Project creation does not guarantee a dedicated line; shared and dedicated allocation depends on the project's plan.

When application code needs Spectrum credentials, retrieve them through `photon projects show` or the project page in the Dashboard, store them in an ignored environment file or secret manager, and never echo them back to the user. `photon projects regenerate-secret` is a rotation, not a read operation.

### Green light vs. confirm first

So "set it up" never becomes "spent the user's money" or "broke their integration":

- **Run freely** when requested: install or invoke the CLI, `whoami`, `auth status`, `projects ls`, `projects show`, free project creation, `config show`, `env current`, `ping`, and read-only Spectrum or billing inspection.
- **Confirm first:** `projects upgrade`, `billing checkout`, Stripe portal actions that change a subscription, `projects delete`, `spectrum lines remove`, and `projects regenerate-secret`. Secret rotation invalidates the previous credential immediately.

The full login and bootstrap walkthrough is in [`getting-started.md`](./getting-started.md).

## How this skill is organized

Each topic lives in its own file in this directory. Read the file relevant to the user's question.

| File | When to consult |
|---|---|
| [`getting-started.md`](./getting-started.md) | One-off and global installation, standalone binaries, device login, project creation, and the first verification loop. |
| [`commands.md`](./commands.md) | Command tree, project operations, billing, profiles, diagnostics, aliases, and destructive-action boundaries. |
| [`spectrum.md`](./spectrum.md) | The `photon spectrum` group — project profile, users, lines, platforms, and avatar upload. |
| [`workflows.md`](./workflows.md) | End-to-end recipes for bootstrap, inspection, CI, billing, dedicated lines, and deliberate credential rotation. |
| [`environment.md`](./environment.md) | Backend, token, active project, config directory, credentials storage, CI, and resolution priority. |

## See also

- [Photon CLI documentation](https://photon.codes/docs/cli/overview)
- [Photon Dashboard](https://app.photon.codes/)
- The `spectrum` skill in this repository for runtime agent and messaging logic
- The `photon-api` skill for direct HTTPS automation and OAuth integrations
