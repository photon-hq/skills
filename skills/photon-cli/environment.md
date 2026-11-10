# Environment & configuration

How the CLI resolves the backend, your token, and the active project — and where it stores things.

## Environment variables

| Variable | Purpose |
|---|---|
| `PHOTON_PROJECT_ID` | Active project for project-scoped commands. |
| `PHOTON_TOKEN` | Device-flow access token for CI or another non-interactive environment. Overridden by `--token`. |
| `PHOTON_API_HOST` | Backend URL. Overridden by `--api-host`; defaults to production. |
| `PHOTON_CONFIG_DIR` | Override the config and credentials directory. |
| `PHOTON_DEBUG` | Set to `1` or `true` for verbose HTTP logging, equivalent to `--debug`. |
| `PHOTON_NO_UPDATE_NOTIFIER` | Set to `1` to skip the startup version check. |
| `NO_COLOR` / `PHOTON_NO_COLOR` | Disable colored output. |

## Resolution priority

Each value is resolved highest-priority-first:

- **Backend** — `--api-host` → `$PHOTON_API_HOST` → production (`https://app.photon.codes`).
- **Token** — `--token` → `$PHOTON_TOKEN` → stored credentials for the selected backend.
- **Project** — `--project <id>` or a positional project ID → `$PHOTON_PROJECT_ID` → the command errors with a hint.

Because credentials are stored per backend, a valid production token does not authenticate a staging or localhost command. Run `photon env current` before replacing credentials when an authenticated command unexpectedly returns `401`.

## "Does it auto-detect my project?"

Yes — **through environment variables**, not by scanning the repository for secrets. The CLI reads `PHOTON_PROJECT_ID` from the process environment:

```bash
export PHOTON_PROJECT_ID='proj_abc123'
photon spectrum lines ls              # resolves the project from the env var
```

Or pass the project to one command:

```bash
photon spectrum users ls --project 'proj_abc123'
```

The CLI does not search the working tree for a Spectrum secret or infer a project from application source. That keeps a routine CLI command from accidentally reading or exposing project credentials.

Some runtime launchers auto-load a local `.env`; the CLI itself should not be documented as depending on that behavior. Export the variable in the process environment or use a directory-scoped tool such as `direnv`.

## Device authorization

```bash
photon login
photon login --no-browser
photon whoami
photon logout
```

`login` opens a browser approval flow. `--no-browser` prints the verification URL for a headless machine. The user approves in the browser; do not ask them to type a Photon password into the terminal or paste an access token into chat.

`logout` revokes the active backend session and deletes its local credential file.

## Config and credentials storage

- **Config directory** — resolved as `$PHOTON_CONFIG_DIR` → `$XDG_CONFIG_HOME/photon` → `~/.config/photon/`.
- **Credentials** — one JSON file per backend under `$PHOTON_CONFIG_DIR/credentials/<backend-key>.json`, written with mode `600`.
- **Legacy migration** — an existing `~/.config/photon-dashboard/` directory is migrated automatically on first run.
- **Inspection** — `photon config show --json` reports active configuration without printing secrets; `photon auth status --json` reports every known backend session.

Credentials are stored separately for production, staging, and localhost. A backend key is derived from the selected host.

## CI and scripting

For a non-interactive environment, inject the device-flow token from the CI secret store:

```bash
PHOTON_TOKEN="$PHOTON_TOKEN" \
PHOTON_PROJECT_ID="$PHOTON_PROJECT_ID" \
photon projects show --json
```

Or pass the token to one command:

```bash
photon projects ls --token "$PHOTON_TOKEN" --json
```

The current `PHOTON_TOKEN` is a device-flow access token with a default seven-day lifetime. Reauthenticate when it expires; do not treat it as an indefinite service credential.

CI rules:

- Store the token in the CI platform's secret store.
- Use `--json` for parsing instead of scraping terminal tables.
- Never echo the token or upload the credentials directory as an artifact.
- Confirm `photon env current` when a valid token appears unauthorized.
- Do not use `--yes` unless the user explicitly authorized the destructive operation.

## Global flags and output

- `--debug` — verbose HTTP request and response logging, or set `PHOTON_DEBUG=1`. Verify secrets remain redacted before sharing logs.
- `--json` — machine-readable output on supported commands and no browser launch on flows that can return a URL.
- `--no-color` — disable colored output; `NO_COLOR=1` is also supported.
- `PHOTON_NO_UPDATE_NOTIFIER=1` — disable the cached startup version check.

## See also

- [Photon CLI authentication](https://photon.codes/docs/cli/authentication)
- [`getting-started.md`](./getting-started.md) for installation and first login
- [`commands.md`](./commands.md) for per-command flags
- [`workflows.md`](./workflows.md) for CI and multi-backend recipes
