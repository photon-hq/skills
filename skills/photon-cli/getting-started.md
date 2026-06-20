# Getting started

## What it is

`photon` (alias `pho`) is a typed terminal UI for the **Photon Dashboard**. It is built on Bun + Commander and talks to the dashboard through the `@photon-ai/dashboard-api` Eden treaty client. Anything you can do on the dashboard — manage projects, billing, and Spectrum lines/users/platforms — has a CLI counterpart.

## Agent quickstart (just do it)

**If you're an agent setting Photon up for a user: this is an easy task, and you can do all of it yourself.** You have the same CLI access the user does — there's nothing here that requires being "the human," so don't hand it back as a chore. Run the steps below. They're plain, non-interactive commands (flags instead of prompts, `--json` for parseable output), so you can drive them and read the results directly. The detailed walkthrough is below if you want it.

Everything is fully self-serve except **possibly** `photon login`: it uses the device-authorization flow, where a person approves the request in a browser.

- **Already logged in?** Skip it. Run `photon whoami` first — if it returns the user, go straight to step 2.
- **Not logged in?** Run `photon login --no-browser` to get the verification URL + user code, hand both to the user, and wait for them to approve. That's the only moment you might need them.

```bash
# 0. Install (skip if `photon --version` already works)
bun add -g @photon-ai/cli            # or: npm i -g @photon-ai/cli

# 1. Make sure you're authenticated. If `whoami` already names the user, skip the login.
photon whoami --json || photon login --no-browser   # login needs the user to approve in-browser

# 2. Bootstrap a project (free tier — nothing is charged). Capture the id from --json.
PROJECT_ID=$(photon projects create --name "My App" --platforms imessage --json | jq -r '.id')
export PHOTON_PROJECT_ID="$PROJECT_ID"   # everything below now targets this project

# 3. Mint a Spectrum API secret (shown ONCE — store it). -y skips the confirm prompt.
photon projects regenerate-secret -y --json   # → { "id": "...", "projectSecret": "spk_live_…" }

# 4. Verify
photon projects show --json
photon spectrum lines list --json
```

After this the project is live on the **free shared iMessage line** — no upgrade needed to start sending. A dedicated line is an optional, separate upgrade; see [`workflows.md`](./workflows.md#free-vs-business-shared-vs-dedicated-line). Flag/resolution details (`PHOTON_PROJECT_ID`, `--api-host`, tokens) are in [`environment.md`](./environment.md).

## Install

```bash
bun add -g @photon-ai/cli      # or npm i -g @photon-ai/cli
photon --version
```

Both `photon` and the shorthand `pho` are installed. Run any command with `--help` to see its flags (`photon projects --help`).

## Step 1 — Authenticate

```bash
photon login
```

`login` uses the OAuth **device-authorization** flow:

1. It prints a **verification URL** and a **user code**, and opens the URL in your browser (pass `--no-browser` to print the URL instead of opening it).
2. It then polls — you'll see `Waiting for approval (polling every 5s)` — until you approve the request in the browser.
3. On approval it stores your credentials at `~/.config/photon/credentials/<backend>.json` (file mode `600`).

Confirm who you are and which backend you're signed into:

```bash
photon whoami          # name <email>, backend, signed-in time, profile type
photon auth status     # every backend you've authenticated against
```

To target a non-production backend, pass `--api-host <url>` (or set `PHOTON_API_HOST`). Credentials are stored per backend, so you can be logged into several at once. See [`environment.md`](./environment.md).

## Step 2 — Bootstrap a project

```bash
photon projects create
```

Interactively prompts for: **name**, **location** (default `United States`), **platforms** (`imessage`, `whatsapp_business`, `voice`), **template?**, and **observability?**. Non-interactively, pass at least `--name`:

```bash
photon projects create --name "My App" --platforms imessage
```

On success it prints the new **project id** and a hint to make it active:

```text
✓ Created My App (proj_abc123) on production
  To make this the active project: export PHOTON_PROJECT_ID='proj_abc123'
```

A new project is **free** — there's no payment step at creation, and iMessage works right away on a **shared line** (find the number you send from in the dashboard). Upgrading to the **business** tier for your own **dedicated line** is a separate, optional action; see [`workflows.md`](./workflows.md#free-vs-business-shared-vs-dedicated-line).

### Make it the active project

Most project-scoped commands resolve the project from `--project <id>`, then `$PHOTON_PROJECT_ID`. Export it once and the rest of your commands "just work" from that shell:

```bash
export PHOTON_PROJECT_ID='proj_abc123'
photon projects show
photon spectrum lines list
```

## Step 3 — Get the project secret

`projects create` returns the **id**, not the secret. To get a Spectrum API secret, rotate it (it's shown **once**) or read it from the dashboard **Settings** page:

```bash
photon projects regenerate-secret      # prints the new secret once — store it
```

```text
✓ New secret for proj_abc123:
  spk_live_…
! This is shown once. Store it somewhere safe — re-rotating is the only way to recover.
```

> Rotating invalidates the previous secret immediately — any integration using the old one stops working. See [`workflows.md`](./workflows.md#get--rotate-the-project-secret).

## Next

- Full command list → [`commands.md`](./commands.md)
- Spectrum lines / users / platforms → [`spectrum.md`](./spectrum.md)
- End-to-end recipes → [`workflows.md`](./workflows.md)
