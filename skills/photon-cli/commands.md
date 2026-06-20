# Command reference

Every command in the `photon` CLI except the `spectrum` group (which has its own file: [`spectrum.md`](./spectrum.md)). For environment variables and resolution order, see [`environment.md`](./environment.md).

## Common flags

These appear on most commands:

| Flag | Meaning |
|---|---|
| `--api-host <url>` | Target backend. Falls back to `$PHOTON_API_HOST`, then production (`https://app.photon.codes`). |
| `-t, --token <token>` | API token; overrides stored credentials. Falls back to `$PHOTON_TOKEN` / `$DASHBOARD_TOKEN`. |
| `-p, --project <id>` | Project id; overrides `$PHOTON_PROJECT_ID`. Project-scoped commands only. |
| `--json` | Machine-readable JSON output (also suppresses browser-opening). |
| `-y, --yes` | Skip the confirmation prompt on destructive commands. |
| `--no-browser` | Print the URL instead of launching a browser. |
| `--debug` | Global flag — verbose HTTP request/response logging. |

## Diagnostics

### `photon ping`
Hit the dashboard `/api/health` endpoint; prints HTTP status + elapsed time.
- `--api-host <url>`, `-u, --url <url>` (raw URL, bypasses env resolution).

### `photon env [current]`
Show the active backend (name + URL).
- `--api-host <url>`.

### `photon config [show]`
Dump the active configuration — config dir, current backend, active project (`$PHOTON_PROJECT_ID` or none), and which backends have stored credentials. No secrets printed.
- `--json`.

## Authentication

### `photon login`
Device-authorization login. Prints a verification URL + user code, opens the browser, polls until approved, stores credentials at `~/.config/photon/credentials/<backend>.json` (mode `600`).
- `--api-host <url>`, `--no-browser`.

### `photon logout`
Clear stored credentials for the active backend (best-effort server-side revoke first).
- `--api-host <url>`.

### `photon whoami`
Show the user authenticated for the active backend — name, email, backend, sign-in time, profile type.
- `--api-host <url>`, `-t, --token <token>`.

### `photon auth status`
Table of every backend you've authenticated against (active backend marked `●`; corrupt credential files flagged).
- `--json`.

## Profile

Your developer/organization profile (onboarding details), distinct from the per-project Spectrum profile in [`spectrum.md`](./spectrum.md).

### `photon profile [show]`
Show your profile — type (developer/organization), platforms, background, company name, referral source.
- `--api-host`, `-t/--token`, `--json`.

### `photon profile init`
Create your profile (fails if one already exists). Interactive, or pass flags:
- `--type <developer|organization>`, `--platforms <list>`, `--background <text>`, `--company-name <name>` (organization only), plus `--api-host`, `-t/--token`, `--json`.

### `photon profile update` (alias `edit`)
Update an existing profile; preserves unset fields. Requires at least one field flag. Same flags as `init`.

## Projects

`photon projects` (alias `project`) — manage Photon Dashboard projects.

| Subcommand | Aliases | What it does |
|---|---|---|
| `list` (default) | `ls` | Table of your projects: id, name, location, status (running/paused/error), platforms, updated. |
| `show [id]` | `get` | Details for one project (defaults to `$PHOTON_PROJECT_ID`). |
| `create` | `new` | Create a project. Interactive, or `--name` required non-interactively. Returns the project **id**. |
| `update [id]` | `edit`, `rename` | Rename a project. Requires `--name`. (Only the name is mutable via this route.) |
| `delete [id]` | `rm`, `remove` | Permanently delete a project. Confirms unless `-y/--yes`. |
| `regenerate-secret [id]` | `rotate-secret` | Rotate the Spectrum API secret. Shown **once**. Confirms unless `-y/--yes`. |
| `open [id]` | — | Open the project in the dashboard web UI. `--no-browser` to print the URL. |
| `upgrade [id] [tier]` | — | Subscribe / pay. Smart-routes to Stripe checkout or the billing portal. Tiers: `pro`, `business`, `enterprise`. |
| `check-phone <number>` | — | Check whether a phone number is available on Spectrum. |

Notable flags:
- **`create`**: `-n/--name`, `-l/--location` (default `United States`), `--platforms <list>` (`imessage`, `whatsapp_business`, `voice`), `--template`, `--observability`.
- **`upgrade`**: `--plan <price-id>` (raw Stripe price id, escape hatch), `--qty <n>`, `--checkout` (force checkout), `--manage` (force Stripe portal). With no tier/flags it inspects the current subscription to choose the route. `[id]` and `[tier]` are both positional — `photon projects upgrade business` works when `$PHOTON_PROJECT_ID` is set.
- All project subcommands accept the common `--api-host`, `-t/--token`, `--json` (and `-p/--project` where an `[id]` is taken).

```bash
photon projects ls
photon projects show                       # uses $PHOTON_PROJECT_ID
photon projects create --name "My App"
photon projects regenerate-secret          # new secret, shown once
photon projects upgrade business           # business tier (see workflows.md)
photon projects check-phone +14155551234
```

## Billing

`photon billing` — subscription management for a project (defaults to `$PHOTON_PROJECT_ID`).

| Subcommand | Aliases | What it does |
|---|---|---|
| `plans` | — | List available subscription plans (name, price id, price, interval). |
| `show` | — | Show the project's current subscription (tier, status, id). |
| `checkout [tier]` | — | Start a checkout. Interactive picker if no tier/`--plan`. Tiers: `pro`, `business`, `enterprise`. |
| `manage` | `portal` | Open the Stripe customer portal (downgrade, cancel, change card). |

Notable flags:
- **`checkout`**: `--plan <price-id>`, `--qty <n>`, `--no-browser`, `--json` (prints the URL, skips opening the browser).
- All accept `-p/--project`, `--api-host`, `-t/--token`, `--json`.

```bash
photon billing plans
photon billing show
photon billing checkout business
photon billing manage
```

> `projects upgrade` and `billing checkout` overlap. `projects upgrade` is the smart, one-shot path (it figures out checkout vs. portal for you); `billing checkout` / `billing manage` are the explicit forms. See [`workflows.md`](./workflows.md#free-vs-business-shared-vs-dedicated-line).
