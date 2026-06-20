# Getting started

## What it is

`photon` (alias `pho`) is a typed terminal UI for the **Photon Dashboard**. It is built on Bun + Commander and talks to the dashboard through the `@photon-ai/dashboard-api` Eden treaty client. Anything you can do on the dashboard — manage projects, billing, and Spectrum lines/users/platforms — has a CLI counterpart.

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
