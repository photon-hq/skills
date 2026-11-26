# Photon CLI 3.x

Every command and flag on this page was checked against `photon <command> --help` of `@photon-ai/cli`
3.3.0. For anything not listed, run `photon <command> --help` before you use it. Docs:
[Photon CLI](https://photon.codes/docs/beta/cli/index.md),
[command reference](https://photon.codes/docs/beta/cli/reference/index.md) (generated, can lag the CLI).

## Contents

- Install and update
- Global options
- Sign in
- Select the organization and project
- Commands: projects, platform resources, API keys, webhooks, other groups
- Commands that print a secret
- Recoverable operations
- JSON output, errors and exit codes
- Environment variables

What the CLI can't do: send, list or read messages (there is no `photon message` command), upload
attachments, 10DLC registration, retry webhook deliveries, or read developer logs. Use MCP or the API for
those ([SKILL.md](../SKILL.md#what-each-surface-can-do)).

## Install and update

```sh
npm install --global @photon-ai/cli   # Node.js 22 or newer; pnpm and Bun work too
photon --version                      # expect 3.x
photon update --check --json          # is a newer version out?
photon update --json                  # update a global npm, pnpm, Yarn or Bun install, or the binary
```

- Standalone binary (no Node.js), macOS and Linux:
  `curl -fsSL https://github.com/photon-hq/cli/releases/latest/download/install.sh | sh`. It installs into
  `~/.local/bin` and edits shell profiles unless `PHOTON_NO_MODIFY_PATH` is set; `PHOTON_BIN_DIR` picks
  another folder. [Installation](https://photon.codes/docs/beta/cli/installation.md)
- Photon CLI 1.0 was `@photon-ai/cli` up to 2.3.0 and is now on the `legacy` tag. Both install `photon`, so
  a global 3.x install with the same package manager replaces 1.0
  ([migrate-from-1.md](migrate-from-1.md)).
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
photon login --no-browser    # print the link without opening a browser
photon whoami --json         # the signed-in account; use it to verify
photon auth status --json    # where the credential comes from ("source": "environment" = PHOTON_API_TOKEN)
photon logout                # deletes the local sign-in only
```

- An agent runs `photon login`, passes the printed link and code to the person, and the person approves
  in a browser. It exits 0 after approval, 4 when the code expires, 130 on Ctrl-C.
- `photon login` does nothing when the session is healthy; `--force` replaces it. `--insecure-storage`
  stores the sign-in in a protected file instead of the OS keychain.
- Where no person can approve a sign-in (CI, scheduled jobs), put a key in `PHOTON_API_TOKEN`: a service
  identity API key (`pho_scred_...`) with only the permissions the job needs, or an account service key
  (`pho_ask_...`) for work that must act as the account. The CLI uses it for every command and saves no
  credential. It doesn't pick a project, so pass `--project`. While it is set, `photon login` refuses with
  `AUTH_ENVIRONMENT_KEY_SET`.
- `photon login --service-key` reads an account service key from non-interactive stdin and stores it, for
  a long-lived server: `printf '%s' "$PHOTON_SERVICE_KEY" | photon login --service-key`.

## Select the organization and project

[Projects](https://photon.codes/docs/beta/cli/projects.md),
[Organizations](https://photon.codes/docs/beta/cli/organizations.md)

- Project commands take the project from `--project`, then `PHOTON_PROJECT_ID`, then the nearest
  `.photon/project.json` (written by `photon link`). Agents pass `--project` on every command.
  `photon project current --json` shows which project a command would use and why.
- `project list`, `project count`, `project create` and the `org member|invitation|oauth-client|billing`
  commands take the organization from `--org`, `PHOTON_ORGANIZATION_ID`, the folder's project,
  `photon org use`, or the only organization the account has; with several and none selected they exit 2
  with `ORGANIZATION_NOT_SELECTED`. `photon org list --json` lists them.
- Before a command changes a project or organization you didn't name with a flag, it prints which one
  and where it came from on stderr. Read that line.

## Commands

Read-only commands need no confirmation. Everything else changes the account: ask the user first.

### Projects

```sh
photon project list --org <pho_org_...> [--search <text>] [--limit 30] [--page-token <token>] --json
photon project view --project <pho_prj_...> --json
photon project create --name "Support line" --slug support-line --org <pho_org_...> \
  --idempotency-key <key> [--link] --json                                              # change
photon project edit --name "New name" --project <pho_prj_...>                         # change
photon project delete <pho_prj_...> --yes                                             # destructive
photon link --project <pho_prj_...>    # writes .photon/project.json, adds .photon/ to .gitignore
```

### Platform resources

[Platform resources](https://photon.codes/docs/beta/cli/projects/platform.md). Add `--project <pho_prj_...>`
and `--json` to each command.

```sh
photon project platform list                                    # platforms available to the project
photon project platform sms list                                # also: imessage, email, telegram, voice list
photon project platform imessage view                           # shared or dedicated mode, assignment limit
photon project platform imessage assignment list|view <id>
photon project platform imessage assignment create --phone-number <E.164> [--idempotency-key <key>]   # uses plan capacity
photon project platform imessage assignment release <pho_asg_...> --yes                              # destructive
photon project platform sms purchase [--area-code 415] --idempotency-key <key> --yes                 # costs money
photon project platform sms delete <pho_res_...> --yes                                               # releases the number
photon project platform imessage purchase --idempotency-key <key> --yes                              # costs money
photon project platform email connect <domain> --no-wait --no-browser   # DNS records in operation.detail.dnsRecords
photon project platform email dns <pho_opr_...>
photon project platform email disconnect <pho_res_...> --yes
photon project platform telegram list|view [<pho_res_...>]
photon project platform telegram connect --no-wait --no-browser          # setup link: see channels/telegram.md
photon project platform telegram disconnect <pho_res_...> --yes
photon project platform whatsapp-business number add --source byon|photon ... --no-browser   # see channels/whatsapp-business.md
photon project platform operation cancel <pho_opr_...> --yes
```

- `--first-name`, `--last-name` and `--email` on `assignment create` only change how the person is shown;
  the handle is `--phone-number`. Email handles are added in the dashboard.
- An idempotency key names one logical purchase forever: reusing it resumes that purchase instead of
  buying another. Use a fresh key for each new resource.
- Purchases wait until done; dedicated iMessage provisioning can take hours. Ctrl-C stops only the local
  wait; `photon operation replay <local-id> --yes` resumes it without buying again (the user's yes to the
  purchase covers the replay).
- Voice routing: `photon project platform voice profile list|view|create|edit|delete`,
  `voice profile inbound set|edit|clear`, `voice profile outbound enable|rotate|edit|revoke`, and
  `voice assignment view|set|clear`. See [channels/voice.md](channels/voice.md).

### API keys

[API keys](https://photon.codes/docs/beta/cli/projects/api-keys.md)

```sh
photon project api-key list --project <pho_prj_...> --json
photon project api-key create --name <name> --permission project:read --permission project:write \
  (--expires-at <RFC 3339> | --no-expiry) [--idempotency-key <key>] --project <pho_prj_...> --json   # secret once
photon project api-key revoke <api-key-id> --yes --project <pho_prj_...>
```

A key's ID is `pho_sk_` plus 26 characters, the first part of the full key; it is safe to log. `revoke`
takes the ID, not the full key. To rotate: create a replacement, deploy it, verify traffic, then revoke the
old one.

### Webhooks

[Webhooks](https://photon.codes/docs/beta/cli/projects/webhooks.md)

```sh
photon project webhook api-version list --project <pho_prj_...> --json     # "selectable": true
photon project webhook event-type list --api-version 2026-07-01 --project <pho_prj_...> --json
photon project webhook list|view <pho_whd_...> --project <pho_prj_...> --json
photon project webhook create --name <name> --url https://... --api-version 2026-07-01 \
  --event message.received [--idempotency-key <key>] --project <pho_prj_...> --json   # secret once
photon project webhook edit <pho_whd_...> --status disabled --project <pho_prj_...>
photon project webhook rotate-secret <pho_whd_...> [--overlap-seconds 86400] --yes --project <pho_prj_...> --json   # secret once
photon project webhook delete <pho_whd_...> --yes --project <pho_prj_...>
```

`--all-events` subscribes to every event type. A destination's API version is fixed; to upgrade, run a
second destination on the new version, verify it, then delete the old one. `edit --event` replaces the
whole subscription.

### Other groups

`photon project agent-profile view|edit|avatar`, `photon project billing overview|invoice|plan|subscription|operation`,
`photon org member|invitation|oauth-client|billing`, `photon account service-key list|create|revoke`,
`photon account oauth`. Plan purchases, subscription changes, member changes and account service keys are
for the person to approve; account service keys act as the whole account, so the person creates them.
Read each `--help` first.

## Commands that print a secret

These print a secret exactly once on stdout. Run one only after the user says yes to that exact change,
and always pipe stdout straight into [store-secret.mjs](../scripts/store-secret.mjs), with
`set -o pipefail` and `--json`:

| Command | `--field` | Typical `--key` |
| --- | --- | --- |
| `photon project api-key create ... --json` | `secret` | `PHOTON_API_KEY` |
| `photon project webhook create ... --json`, `webhook rotate-secret ... --json` | `signingSecret` | `PHOTON_WEBHOOK_SECRET` |
| `photon project platform voice profile outbound enable\|rotate <profile> --json` | `password` | the name your voice provider's config reads |
| `photon org oauth-client secret create\|rotate <client-id> --json` | `value` | the name your app reads |

```sh
set -o pipefail
photon project webhook create --project <pho_prj_...> --name my-agent --url https://example.com/photon \
  --api-version 2026-07-01 --event message.received --json \
  | node <this skill>/scripts/store-secret.mjs --field signingSecret --key PHOTON_WEBHOOK_SECRET --file .env.local
```

The script prints only `stored KEY in FILE` and refuses a file that is a symbolic link, tracked by Git, or
not ignored by Git. Read the ID you need afterwards with `list` (keys, webhooks) or `view` (voice
profiles), never from the secret. When the secret belongs in a deployed secret manager, the person moves
it there from the env file; don't print it to do so.

## Recoverable operations

[Recoverable operations](https://photon.codes/docs/beta/cli/operations.md). Most writes are journaled
locally. When a write's result was lost, don't guess and don't repeat it with a new key:

```sh
photon operation list [--status awaiting-output-ack|failed|outcome-unknown] --json
photon operation view <local-id> --json
photon operation replay <local-id> --yes --json    # finish or re-read the same operation
```

If a secret-producing command's output never reached the file, look for its record with
`photon operation list --status awaiting-output-ack --json`. Its replay prints the secret again, under
`result`: pipe it into the same `store-secret.mjs` command (the script reads `result.<field>` too).
Without a record the secret is gone: revoke or rotate it and make a new one, after asking. With `PHOTON_API_TOKEN` there is no
journal: pass your own `--idempotency-key` on every write that takes one, keep it until the result is
known, and repeat a failed write with the same key and input.

## JSON output, errors and exit codes

[JSON output and exit codes](https://photon.codes/docs/beta/cli/output.md)

- With `--json`, a failure prints `{"error": {...}}` on stdout with `code` (branch on it), `message`,
  `retryable`, `retryAfterSeconds`, `requestId`, `docsUrl`, `issues`, and `next`: ordered fix steps, each
  with a `run` command or a `url`, and `person: true` when only a person can do it. A command that fails
  while writing its result puts the error on stderr, so check the exit code first.
- Exit codes: `0` success, `1` failure (including a declined confirmation), `2` invalid usage
  (`CONFIRMATION_REQUIRED`, `PROJECT_NOT_SELECTED`, `ORGANIZATION_NOT_SELECTED`, `LEGACY_COMMAND`,
  `LEGACY_TOKEN`, `AUTH_ENVIRONMENT_KEY_SET`), `4` sign-in needed, `130` Ctrl-C.
- The CLI asks questions only at a real terminal without `--json`, `--no-input` or `CI`. Otherwise a
  command that costs money or can't be undone fails with `CONFIRMATION_REQUIRED` and changes nothing until
  you pass `--yes`. Pass `--yes` only after the user said yes to that exact change.

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
