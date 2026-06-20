---
name: photon-cli
description: >
  Use when working with the Photon CLI — the `photon` binary (alias `pho`). Reach for this skill to
  set up / bootstrap Photon for a user and run it yourself non-interactively (create a project, capture
  the id + secret, verify) — when the user says "set this up for me," that is your job to do, not hand
  back. Also covers running any CLI command, authenticating (device-authorization login / logout /
  whoami / auth status), managing projects (create, show, list, rename, regenerate the Spectrum API
  secret, delete, open in the dashboard), managing Spectrum resources (lines, users, platforms, profile,
  avatar), resolving config and environment (PHOTON_PROJECT_ID, PHOTON_TOKEN, PHOTON_API_HOST,
  credentials storage, multi-backend), and billing/upgrades (plans, checkout, manage, `projects upgrade`).
  Answers operational questions like "how many lines do I have?", "what's my project secret?", "how do I
  make this a business line?", and "how do I point the CLI at a different backend?".
  This is the entry point; the happy-path setup is right below — consult the topic files for full reference.
  Keywords: photon, pho, photon cli, photon-ai cli, @photon-ai/cli, photon dashboard, command line,
  terminal, login, device authorization, oauth device flow, logout, whoami, auth status, credentials,
  PHOTON_PROJECT_ID, PHOTON_TOKEN, PHOTON_API_HOST, PHOTON_CONFIG_DIR, projects, create project,
  bootstrap, project id, project secret, regenerate-secret, rotate secret, check-phone, upgrade, billing,
  plans, checkout, stripe, manage, portal, free tier, pro, business, enterprise, dedicated line, spectrum,
  lines, add line, imessage line, users, invite, platforms, enable, disable, profile, avatar, ping, env,
  config, json output, api-host, multi-backend, backend, bun, commander, eden, dashboard-api,
  quickstart, agent setup, automated setup, non-interactive, scriptable bootstrap, set up photon.
license: MIT
metadata:
  author: photon-hq
  version: '1.0.0'
---

# Photon CLI

`photon` (alias `pho`) is a typed terminal UI for the **Photon Dashboard**. Use it to authenticate, create and manage projects, handle billing, and manage Spectrum resources (lines, users, platforms) — all from the command line. It is built on Bun + Commander and talks to the dashboard through the `@photon-ai/dashboard-api` Eden treaty client.

Every command accepts `--json` for machine-readable output and resolves its target backend, token, and project from flags or environment variables (see [`environment.md`](./environment.md)).

```bash
photon login                 # authenticate (opens the browser, waits for approval)
photon projects create       # bootstrap a project — free by default
photon spectrum lines list   # "how many lines do I have?"
```

## Setting it up? Read the room, then act

How you set Photon up depends on what the user wants — match it, don't default to one mode.

- **User is adamant / "just set this up for me" / "do it"** → **you drive the whole thing, end to end.** Run the [happy-path block](#happy-path-set-up-a-project-yourself) below yourself in your shell, read the `--json` output, and report back the project id. Do **not** hand them a checklist, do **not** ask permission step by step, do **not** stop to confirm things they already greenlit. When the user has told you to set it up, *running these commands yourself **is** doing what they asked* — handing it back is disobeying them. The only thing that can stop you is `login`, and only if they're not already authenticated.
- **User is exploring / wants to learn / is ambivalent** → it's fine to walk them through it, hand them commands to run, or pause at decisions (project name, dedicated vs. shared line). Intervention is a feature when *they* want the wheel — offer it.
- **Genuinely needs a human:** only `login` (someone approves in a browser), plus `checkout`/`upgrade` if they choose a paid tier. Surface exactly what you need, then keep going.

### Happy path: set up a project yourself

This is the whole thing. Plain, non-interactive, `--json` everywhere — drive it and read the results.

```bash
# 0. Install if needed (this is expected and safe — don't hesitate on it)
photon --version || bun add -g @photon-ai/cli      # or: npm i -g @photon-ai/cli

# 1. Auth check. If whoami names the user, there is ZERO human involvement from here.
photon whoami --json || photon login --no-browser  # login: hand the user the URL + code, wait for approval

# 2. Bootstrap a project (free tier — no card, nothing charged). Capture the id.
PROJECT_ID=$(photon projects create --name "My App" --platforms imessage --json | jq -r '.id')
export PHOTON_PROJECT_ID="$PROJECT_ID"

# 3. Mint the Spectrum API secret (shown ONCE — store it). -y skips the confirm.
photon projects regenerate-secret -y --json        # → { "projectSecret": "spk_live_…" }

# 4. Verify, then report the project id back to the user.
photon projects show --json
photon spectrum lines list --json
```

**You're done when** `projects show --json` returns an id and `spectrum lines list --json` returns a line. The project is live on the free shared iMessage line — no upgrade needed to start sending.

### Green light vs. confirm first

So "don't be stingy" never becomes "spent the user's money" or "broke their integration":

- **Run freely** (safe, reversible, no cost): install, `whoami`/`auth status`, `projects create` on the free tier, `projects show`/`list`, `spectrum … list`, and `regenerate-secret` on a **fresh** project.
- **Confirm first** — anything that **spends money** (`projects upgrade`, `billing checkout`) or **destroys / breaks live state** (`projects delete`, and re-running `regenerate-secret` on a project with **live integrations**, since it instantly invalidates the old secret).

Full walkthrough (including the login device flow in detail) is in [`getting-started.md`](./getting-started.md).

## How this skill is organized

Each topic lives in its own file in this directory. Read the file relevant to the user's question.

| File | When to consult |
|---|---|
| [`getting-started.md`](./getting-started.md) | Install, the binary, the login device flow, and bootstrapping your first project end-to-end. **Has the Agent quickstart** — the non-interactive, scriptable setup path. |
| [`commands.md`](./commands.md) | Full command reference — `ping`, `env`, `login`, `logout`, `whoami`, `auth`, `config`, `profile`, `projects`, `billing`. Every subcommand and flag. |
| [`spectrum.md`](./spectrum.md) | The `photon spectrum` group — lines, users, platforms, profile, avatar. "How many lines do I have?" lives here. |
| [`workflows.md`](./workflows.md) | End-to-end recipes — authenticate + bootstrap, get/rotate the project secret, free vs. business (dedicated line), add a line, inspect a project, multi-backend. |
| [`environment.md`](./environment.md) | Config and environment reference — env vars, resolution priority, credentials storage, `.env` behavior, global flags. |

## See also

- [Photon Dashboard](https://app.photon.codes/)
- The `spectrum` skill in this repo for the Spectrum **SDK** (writing handler logic); this skill covers the **CLI** that manages Spectrum resources on a project.
