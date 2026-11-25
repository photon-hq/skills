# Photon CLI 3.x

Every command, flag and environment variable on this page was checked against `photon <command> --help`
from `@photon-ai/cli` 3.3.0 on 2026-11-25. For anything not listed, run `photon <command> --help` before you
use it. Docs: [Photon CLI](https://photon.codes/docs/beta/cli/index.md),
[command reference](https://photon.codes/docs/beta/cli/reference/index.md).

## Install and update

```sh
npm install --global @photon-ai/cli   # Node.js 22 or newer
photon --version                      # expect 3.x
photon update --check                 # report whether a newer version exists
photon update                         # update a global npm, pnpm, Yarn or Bun install, or the binary
```

- Standalone binary (no Node.js), macOS and Linux:
  `curl -fsSL https://github.com/photon-hq/cli/releases/latest/download/install.sh | sh`. It installs into
  `~/.local/bin` and edits shell profiles unless `PHOTON_NO_MODIFY_PATH` is set.
  [Installation](https://photon.codes/docs/beta/cli/installation.md)
- Photon CLI 1.0 was published as `@photon-ai/cli` up to 2.3.0 and now sits on the `legacy` tag. Both install
  `photon`, so a global 3.x install with the same package manager replaces 1.0. When 3.x meets a 1.0 command
  or credential it exits 2 with `LEGACY_COMMAND` or `LEGACY_TOKEN` and does nothing.
  [Migrate from 1.0](https://photon.codes/docs/beta/cli/migrate-from-1.md)
- If `photon --version` shows an older version than you installed, another copy is first on `PATH`:
  `type -a photon` lists them.

## Global options

| Option | Effect |
| --- | --- |
| `--json` | Print one JSON object on stdout: the result, or `{"error": {...}}` |
| `--no-input` | Never ask a question; fail and name the flag that supplies the answer |
| `--project <project>` | Project for this command (or `PHOTON_PROJECT_ID`) |
| `--org <org>` | Organization for this command (or `PHOTON_ORGANIZATION_ID`) |
| `--debug` | Sanitized HTTP and error diagnostics |
| `--no-color` | Plain output |

## Sign in

[Authentication](https://photon.codes/docs/beta/cli/authentication.md),
[Service keys](https://photon.codes/docs/beta/cli/service-keys.md)

```sh
photon login                 # device code: prints a link and a code on stderr, waits for approval
photon login --no-browser    # print the links without opening a browser
photon whoami --json         # the signed-in account; use it to verify
photon auth status --json    # authenticated | not_authenticated | unavailable | unverified
photon account view --json   # the full account resource
photon logout                # deletes the local sign-in only
```

- An agent runs `photon login`, passes the printed link and code to the person, and the person approves in a
  browser. The command exits 0 after approval, 4 when the code expires, 130 on Ctrl-C.
- `photon login` does nothing when the session is healthy; `--force` replaces it with a new sign-in.
  `--insecure-storage` stores the sign-in in a file instead of the OS keychain (Linux needs Secret Service
  through `secret-tool`; containers fall back to a `0600` file and print a warning).
- Where no person can approve a sign-in (CI, scheduled jobs), the person puts a key in `PHOTON_API_TOKEN`:
  a service identity API key (`pho_scred_...`) with only the permissions the job needs, or an account service
  key (`pho_ask_...`) for work that must act as the account. Every command uses it and the CLI saves no
  credential. A key in the variable doesn't pick a project, so pass `--project` or set `PHOTON_PROJECT_ID`.
  While it is set, `photon login` refuses with `AUTH_ENVIRONMENT_KEY_SET`.
- `photon login --service-key` reads an account service key from non-interactive stdin and stores it, for a
  long-lived server: `printf '%s' "$PHOTON_SERVICE_KEY" | photon login --service-key`. It refuses a terminal,
  so the key never lands in shell history.
- Creating or rotating keys is a person's job, not an agent's or CI's.

## Select the organization and project

[Projects](https://photon.codes/docs/beta/cli/projects.md),
[Organizations](https://photon.codes/docs/beta/cli/organizations.md)

- Project-scoped commands resolve the project from `--project`, then `PHOTON_PROJECT_ID`, then the nearest
  `.photon/project.json` written by `photon link`. Agents and scripts pass `--project` (or set
  `PHOTON_PROJECT_ID`) on every command and don't rely on the folder. `photon project current --json` shows
  which project a command would use and where it came from.
- `project list`, `project count`, `project create` and the `org member|invitation|oauth-client|billing`
  commands use the organization from `--org`, `PHOTON_ORGANIZATION_ID`, the folder's project, `photon org use`,
  or the only organization the account has. With several and none selected they exit 2 with
  `ORGANIZATION_NOT_SELECTED`. `photon org list --json` lists them; `photon org show` shows the current one.
- Before a command changes a project or organization you didn't name with a flag, it prints which one and
  where it came from on stderr. Read that line.

## Commands

Read-only commands need no confirmation. Everything else changes the account: ask the user first.

### Projects

```sh
photon project list --org <pho_org_...> [--search <text>] [--limit 30] [--page-token <token>] --json
photon project count --org <pho_org_...> --json
photon project view --project <pho_prj_...> --json
photon project create --name "Support line" --slug support-line --org <pho_org_...> \
  --idempotency-key <key> --json                                                                 # change
photon project edit --name "New name" --project <pho_prj_...>                                     # change
photon project delete <pho_prj_...> --yes                                                        # destructive
```

The slug is 3 to 63 lowercase letters, digits and single hyphens. `create --link` and `photon link
--project <id>` write `.photon/project.json` and add `.photon/` to `.gitignore`; `photon unlink` removes it.

### Platform resources

[Platform resources](https://photon.codes/docs/beta/cli/projects/platform.md). Add `--project <pho_prj_...>`
to each command.

```sh
photon project platform list                                    # platforms available to the project
photon project platform sms list                                # also: imessage, email, telegram, voice list
photon project platform imessage view                           # shared or dedicated mode, assignment limit
photon project platform imessage assignment list [--include-released]
photon project platform imessage assignment create --phone-number <E.164> [--email <email>] \
  [--first-name <name>] [--last-name <name>] [--idempotency-key <key>]          # uses plan capacity
photon project platform imessage assignment release <pho_asg_...> --yes        # destructive
photon project platform sms purchase [--area-code 415] --idempotency-key <key> --yes   # costs money
photon project platform imessage purchase --idempotency-key <key> --yes                # costs money
photon project platform sms delete <pho_res_...> --yes                                 # releases the number
photon project platform email connect <domain> [--no-wait] [--no-browser]
photon project platform email dns <pho_opr_...>                 # DNS records to publish
photon project platform email disconnect <pho_res_...> --yes
photon project platform telegram connect --no-wait --no-browser --json   # link in operation.detail.setupUrl
photon project platform telegram disconnect <pho_res_...> --yes
photon project platform whatsapp-business number add --source byon --no-browser --json   # browser handoff
photon project platform operation cancel <pho_opr_...> --yes
```

- An idempotency key names one logical purchase forever: reusing it resumes that purchase instead of buying
  another. Use a fresh key for each new resource.
- Purchases poll until done; dedicated iMessage provisioning can take hours. Ctrl-C stops only the local
  wait; `photon operation replay <local-id>` resumes it without buying again.
- `telegram connect` and `whatsapp-business number add` without `--waba-id` hand off to a person in Telegram
  or the dashboard. Without `--no-wait`, `telegram connect` waits for the bot and prints its link only on
  stderr. The setup link is a secret, so the person runs `telegram connect` themselves (or uses the
  dashboard); the agent only checks progress. Check progress with
  `photon project platform telegram list`, which shows connected bots and pending setups. Run `connect`
  again only while the setup is pending, to pick it back up. With a bot already connected, `connect` asks
  first (or exits 2 with `CONFIRMATION_REQUIRED` without `--yes`) and then fails with
  `409 TELEGRAM_BOT_ALREADY_CONNECTED`: one bot per project, so the old bot has to be disconnected first,
  after the user says yes. Treat that link as a secret: whoever opens it can connect a bot to the project. For
  WhatsApp, pass `handoff.url` to the user.
- Voice routing lives under `photon project platform voice profile ...` (`create --default`,
  `inbound set <profile-id|default> --sip-uri <uri>`, `outbound enable|rotate|revoke`) and
  `voice assignment set|clear`. `outbound enable` and `outbound rotate` print the SIP `password` once on
  stdout: like key creation, the person runs them (or the dashboard), not the agent. Read `--help` for each before use; see [channels/voice.md](channels/voice.md).

### API keys

[API keys](https://photon.codes/docs/beta/cli/projects/api-keys.md)

```sh
photon project api-key list --project <pho_prj_...> --json
photon project api-key create --name <name> --permission project:read --permission project:write \
  (--expires-at <RFC3339> | --no-expiry) --project <pho_prj_...>      # person runs it; secret printed once
photon project api-key revoke <api-key-id> --yes --project <pho_prj_...>
```

`create` prints the secret once on stdout. It belongs in a secret manager, never in source control or a
config file, so leave creation to the person. `revoke` takes the key ID and refuses a full key. To rotate:
create a replacement, deploy it, verify traffic, then revoke the old key.

### Webhooks

[Webhooks](https://photon.codes/docs/beta/cli/projects/webhooks.md)

```sh
photon project webhook api-version list --project <pho_prj_...>
photon project webhook event-type list --api-version 2026-07-01 --project <pho_prj_...>
photon project webhook list --project <pho_prj_...> --json
photon project webhook create --name <name> --url https://... --api-version 2026-07-01 \
  --event message.received [--idempotency-key <key>] --project <pho_prj_...>   # person runs it; secret printed once
photon project webhook edit <pho_whd_...> --status disabled --project <pho_prj_...>
photon project webhook rotate-secret <pho_whd_...> [--overlap-seconds 86400] --yes --project <pho_prj_...>  # person runs it
photon project webhook delete <pho_whd_...> --yes --project <pho_prj_...>
```

`create` and `rotate-secret` print the `whsec_...` signing secret once on stdout, so an agent running them
would put it in its own transcript. Hand both to the person (or the dashboard's **Webhooks** page) and have
them store the secret in the server's secret manager; the agent can run `list`, `edit` and `delete`.

A destination's API version is fixed; to upgrade, run a second destination on the new version, verify it,
then delete the old one. `edit --event` replaces the whole subscription.

### Other groups

`photon project agent-profile view|edit|avatar`, `photon project billing overview|invoice|plan|subscription`,
`photon org member|invitation|oauth-client|billing`, `photon account service-key list|create|revoke`,
`photon account oauth`. Plan purchases, subscription changes, member changes and key creation are for the
person to approve; read each `--help` first.

## Recoverable operations

[Recoverable operations](https://photon.codes/docs/beta/cli/operations.md). Most writes are journaled
locally. When a write's result was lost, don't guess and don't repeat it with a new key:

```sh
photon operation list --json          # unresolved local operations
photon operation view <local-id>
photon operation replay <local-id>    # finish or re-read the same operation
```

A replay of an operation that produces a secret (API key, webhook or voice `create`/`rotate`) prints it
again, so the person runs that replay too.

With `PHOTON_API_TOKEN` there is no journal, and a key the CLI generates can't be matched later. Pass your own
`--idempotency-key` on every write that takes one, keep it until the result is known, and repeat a failed write
with the same key and the same input.

## JSON output, errors and exit codes

[JSON output and exit codes](https://photon.codes/docs/beta/cli/output.md)

- With `--json`, a failure prints `{"error": {...}}` on stdout with `code` (branch on it), `message`,
  `retryable`, `retryAfterSeconds`, `requestId`, `docsUrl`, `issues`, and `next`: ordered fix steps, each with a
  `run` command or a `url`, and `person: true` when only a person can do it (for example adding a card).
  One exception: a command that fails after or while writing its result to stdout puts the error object on
  stderr. Check the exit code first; anything but `0` is a failure even when stdout holds a result.
- Exit codes: `0` success, `1` failure (including a declined confirmation), `2` invalid usage
  (`CONFIRMATION_REQUIRED`, `PROJECT_NOT_SELECTED`, `ORGANIZATION_NOT_SELECTED`, `LEGACY_COMMAND`,
  `LEGACY_TOKEN`, `AUTH_ENVIRONMENT_KEY_SET`), `4` sign-in needed, `130` Ctrl-C.
- The CLI asks questions only at a real terminal without `--json`, `--no-input` or `CI`. Otherwise a command
  that costs money or can't be undone fails with `CONFIRMATION_REQUIRED` and changes nothing until you pass
  `--yes`. Pass `--yes` only after the user said yes to that exact change.

## Environment variables

| Variable | Effect |
| --- | --- |
| `PHOTON_API_TOKEN` | A key every command uses instead of the stored sign-in |
| `PHOTON_PROJECT_ID` | Project, below `--project` |
| `PHOTON_ORGANIZATION_ID` | Organization, below `--org` |
| `PHOTON_API_VERSION` | Overrides the `Photon-Version` the CLI sends (default `2026-07-01`) |
| `PHOTON_NO_INPUT` | Same as `--no-input` |
| `PHOTON_NO_UPDATE_NOTIFIER` | Turns off the daily update check |
| `CI` | No questions, no spinner, no update check |
| `HTTPS_PROXY`, `NO_PROXY`, `NODE_EXTRA_CA_CERTS` | Proxy and extra certificate authorities |
