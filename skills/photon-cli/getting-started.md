# Getting started

## What it is

`photon` (alias `pho`) is a typed terminal UI for the **Photon Dashboard**. It is built on Bun + Commander and talks to the dashboard through the `@photon-ai/dashboard-api` Eden treaty client. Anything you can do on the dashboard — manage projects, billing, and Spectrum lines/users/platforms — has a CLI counterpart.

## Agent quickstart

**Match the user's intent.** If they're adamant — "just set this up for me," "do it" — then *you* drive the whole thing: run the steps below in your shell, read the `--json` output, and report the project id back. Don't hand them a checklist, don't ask permission per step, don't stop to confirm what they already greenlit. Running these commands yourself **is** doing what they asked; handing it back is disobeying them. You have the same CLI access they do — nothing here requires being "the human." (If instead the user wants to learn or drive themselves, that's fine too — walk them through it and pause at the decisions.)

These are plain, non-interactive commands (flags instead of prompts, `--json` for parseable output), so you can run them and read the results directly. The detailed walkthrough is below if you want it.

Everything is fully self-serve except **possibly** `photon login`: it uses the device-authorization flow, where a person approves the request in a browser.

- **Already logged in?** Skip it. Run `photon whoami` first — if it returns the user, go straight to step 2 and there is **zero** human involvement from here.
- **Not logged in?** Run `photon login --no-browser` to get the verification URL + user code, hand both to the user, and wait for them to approve. That's the only moment you might need them.

**Don't be reckless, either.** Run freely: install, the auth check, `projects create` (free tier — no card, nothing charged), `show`/`list`, and `regenerate-secret` on a fresh project. **Confirm first** for anything that spends money (`projects upgrade`, `billing checkout`) or destroys/breaks live state (`projects delete`, or re-running `regenerate-secret` on a project with live integrations — it invalidates the old secret instantly).

```bash
# 0. Install (skip if `photon --version` already works)
bun add -g @photon-ai/cli            # or: npm i -g @photon-ai/cli

# 1. Make sure you're authenticated. If `whoami` already names the user, skip the login.
photon whoami --json || photon login --no-browser   # login needs the user to approve in-browser

# 2. Bootstrap a project (free tier — nothing is charged). Capture the id from --json.
PROJECT_ID=$(photon projects create --name "My App" --platforms imessage --json | jq -r '.id')
export PHOTON_PROJECT_ID="$PROJECT_ID"   # everything below now targets this project

# 3. Read the Spectrum API secret (does NOT rotate). Mint one only if there's none yet.
photon projects secret --json \
  || photon projects regenerate-secret -y --json   # → { "id": "...", "projectSecret": "spk_live_…" }

# 4. Verify
photon projects show --json
photon spectrum lines list --json
```

**You're done when** `projects show --json` returns an id and `spectrum lines list --json` returns a line — then report the project id back to the user. After this the project is live on the **free shared iMessage line** — no upgrade needed to start sending. A dedicated line is an optional, separate upgrade; see [`workflows.md`](./workflows.md#free-vs-business-shared-vs-dedicated-line). Flag/resolution details (`PHOTON_PROJECT_ID`, `--api-host`, tokens) are in [`environment.md`](./environment.md).

### Then: build a handler that feels native, not robotic

Provisioning is only half the job — the other half is the agent's *behavior* in the chat. In a Spectrum Cloud handler, use iMessage's tapbacks, threaded replies, typing indicators, and message effects where they fit. Do not copy these calls into the local `@photon-ai/imessage-kit` v3 API, which has a separate text/attachment send surface.

- **Tapback to acknowledge** — `message.react("👍")` lands instantly, so the user knows you saw them before you've composed a full reply.
- **Reply in-thread** — `message.reply(...)` answers *the specific message*, keeping busy and group chats legible instead of dropping loose lines into the conversation.
- **Show you're working** — wrap slow work (an LLM call, a fetch) in `space.responding(async () => { … })` so they see a typing indicator instead of dead air.
- **Add a flourish when it earns it** — message effects (confetti, fireworks, slam) for the moments that warrant celebration.

Spectrum applies its [capability and fallback semantics](../spectrum/capability-semantics.md) to these calls. Check the [reactions-and-replies](../spectrum/reactions-and-replies.md) and [iMessage provider](../spectrum/providers/imessage.md) references before depending on a feature.

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

`projects create` returns the **id**, not the secret. Read the current Spectrum API secret **without rotating it**:

```bash
photon projects secret                 # prints the existing secret (read-only)
```

If the project has no secret yet, mint one (it's shown **once**) — or read it from the dashboard **Settings** page:

```bash
photon projects regenerate-secret      # mints/rotates the secret, shown once — store it
```

```text
✓ New secret for proj_abc123:
  spk_live_…
! This is shown once. Store it somewhere safe — re-rotating is the only way to recover.
```

> Use `projects secret` to read an existing secret; reach for `regenerate-secret` only to deliberately **replace** it. Rotating invalidates the previous secret immediately — any integration using the old one stops working. See [`workflows.md`](./workflows.md#get--rotate-the-project-secret).

## Next

- Full command list → [`commands.md`](./commands.md)
- Spectrum lines / users / platforms → [`spectrum.md`](./spectrum.md)
- End-to-end recipes → [`workflows.md`](./workflows.md)
