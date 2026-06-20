# Environment & configuration

How the CLI resolves the backend, your token, and the active project — and where it stores things.

## Environment variables

| Variable | Purpose |
|---|---|
| `PHOTON_PROJECT_ID` | Active project for project-scoped commands. |
| `PHOTON_TOKEN` | API token (overridden by `--token`). |
| `PHOTON_API_HOST` | Backend URL (overridden by `--api-host`). Defaults to production. |
| `PHOTON_CONFIG_DIR` | Override the config/credentials directory. |
| `PHOTON_DEBUG` | Set to `1`/`true` for verbose HTTP logging (same as `--debug`). |
| `PHOTON_NO_UPDATE_NOTIFIER` | Set to `1` to skip the startup version check. |
| `NO_COLOR` / `PHOTON_NO_COLOR` | Disable colored output. |
| `DASHBOARD_TOKEN` | Legacy alias for `PHOTON_TOKEN`. |
| `DASHBOARD_CONFIG_DIR` | Legacy alias for `PHOTON_CONFIG_DIR`. |

## Resolution priority

Each value is resolved highest-priority-first:

- **Backend** — `--api-host` → `$PHOTON_API_HOST` → production (`https://app.photon.codes`).
- **Token** — `--token` → `$PHOTON_TOKEN` → `$DASHBOARD_TOKEN` → stored credentials for the active backend.
- **Project** — `--project <id>` (or a positional `[id]`) → `$PHOTON_PROJECT_ID` → the command errors with a hint.

## "Does it auto-detect my project?"

Yes — **through environment variables**, not by scanning your folder for secrets. The CLI reads `PHOTON_PROJECT_ID` (and `PHOTON_TOKEN`, `PHOTON_API_HOST`) from the **process environment**. So running a command inside a project folder "just works" when that variable is set:

```bash
export PHOTON_PROJECT_ID='proj_abc123'
photon spectrum lines list            # resolves the project from the env var
```

Notes:
- The CLI does **not** look for `SPECTRUM_SECRET` / `SPECTRUM_ID` or any project-secret file in the working directory. Project context comes from `PHOTON_PROJECT_ID` (or `--project`).
- When run under **Bun** (e.g. `bun run`), Bun auto-loads a local `.env`, so a `.env` containing `PHOTON_PROJECT_ID=…` is picked up automatically. The shipped binary targets Node, so don't rely on `.env` auto-loading there — `export` the variable (or use a tool like `direnv`) instead.

## Config & credentials storage

- **Config directory** — `~/.config/photon/` by default. Override order: `$PHOTON_CONFIG_DIR` → `$DASHBOARD_CONFIG_DIR` → `$XDG_CONFIG_HOME/photon` → `~/.config/photon`. (A legacy `~/.config/photon-dashboard/` is migrated automatically.)
- **Credentials** — one file per backend at `~/.config/photon/credentials/<backend>.json`, written with mode `600`. The `<backend>` key is `production` for the production URL, otherwise derived from the host.
- Inspect the active config (no secrets printed) with `photon config show`, and all logged-in backends with `photon auth status`.

## Global flags & output

- `--debug` — verbose HTTP request/response logging (or `PHOTON_DEBUG=1`).
- `--json` — machine-readable output on nearly every command; also suppresses browser-opening on commands that would otherwise launch one.
- **Update notifier** — runs at startup, cached for 24h; disable with `PHOTON_NO_UPDATE_NOTIFIER=1`.
