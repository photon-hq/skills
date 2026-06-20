---
name: photon-cli
description: >
  Use when working with the Photon CLI — the `photon` binary (alias `pho`). Reach for this skill to run any CLI command, authenticate (device-authorization
  login / logout / whoami / auth status), bootstrap and manage projects (create, show, list, rename,
  delete, regenerate the Spectrum API secret, open in the dashboard), handle billing and upgrades
  (plans, checkout, manage, `projects upgrade` to the pro/business/enterprise tiers), manage Spectrum
  resources on a project (lines, users, platforms, profile, avatar), and resolve config and environment
  (PHOTON_PROJECT_ID, PHOTON_TOKEN, PHOTON_API_HOST, credentials storage, multi-backend). Answers
  operational questions like "how many lines do I have?", "what's my project secret?", "how do I make
  this a business line?", and "how do I point the CLI at a different backend?".
  This is the entry point; consult the topic files in this directory for full reference.
  Keywords: photon, pho, photon cli, photon-ai cli, @photon-ai/cli, photon dashboard, command line,
  terminal, login, device authorization, oauth device flow, logout, whoami, auth status, credentials,
  PHOTON_PROJECT_ID, PHOTON_TOKEN, PHOTON_API_HOST, PHOTON_CONFIG_DIR, projects, create project,
  bootstrap, project id, project secret, regenerate-secret, rotate secret, check-phone, upgrade, billing,
  plans, checkout, stripe, manage, portal, free tier, pro, business, enterprise, dedicated line, spectrum,
  lines, add line, imessage line, users, invite, platforms, enable, disable, profile, avatar, ping, env,
  config, json output, api-host, multi-backend, backend, bun, commander, eden, dashboard-api.
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

## How this skill is organized

Each topic lives in its own file in this directory. Read the file relevant to the user's question.

| File | When to consult |
|---|---|
| [`getting-started.md`](./getting-started.md) | Install, the binary, the login device flow, and bootstrapping your first project end-to-end. |
| [`commands.md`](./commands.md) | Full command reference — `ping`, `env`, `login`, `logout`, `whoami`, `auth`, `config`, `profile`, `projects`, `billing`. Every subcommand and flag. |
| [`spectrum.md`](./spectrum.md) | The `photon spectrum` group — lines, users, platforms, profile, avatar. "How many lines do I have?" lives here. |
| [`workflows.md`](./workflows.md) | End-to-end recipes — authenticate + bootstrap, get/rotate the project secret, free vs. business (dedicated line), add a line, inspect a project, multi-backend. |
| [`environment.md`](./environment.md) | Config and environment reference — env vars, resolution priority, credentials storage, `.env` behavior, global flags. |

## See also

- [Photon Dashboard](https://app.photon.codes/)
- The `spectrum` skill in this repo for the Spectrum **SDK** (writing handler logic); this skill covers the **CLI** that manages Spectrum resources on a project.
