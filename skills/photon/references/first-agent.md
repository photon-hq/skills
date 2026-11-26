# Set up Photon and get an agent answering messages

The end-to-end job: a person texts the agent's number, the agent receives the message, and the person
gets a reply. Do the setup yourself; don't hand the user a tutorial. Ask only when the user's input is
really needed (which organization or project, the test sender's handle, approving the sign-in, any yes
for a purchase, key or send). If the user only asked to set Photon up or sign in, stop after step 4.

This page uses iMessage, the channel most users start with. For another channel, swap step 5 for that
channel's file listed in [channels.md](channels.md) and keep the rest.

## Contents

1. Look before changing anything
2. Install or update Photon CLI 3
3. Sign in (and, if wanted, connect MCP)
4. Pick the organization and project
5. Make the channel ready (iMessage: shared or dedicated)
6. Create the project API key
7. Configure the env file
8. Write the agent
9. Validate and start
10. Ask the user to test, then report

Do the steps in this order. Don't start the agent before the channel is ready and the key is stored.

## 1. Look before changing anything

Read-only checks: the folder, `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml`, lockfiles, Git
status and branch, `node --version`, existing `@photon-ai/*` dependencies, `.photon/project.json`, env
files and which `PHOTON_*` names they set (names only, never values), existing agent entry points and
scripts, whether `PHOTON_API_TOKEN` is set, and whether the client already has a `photon` MCP server.

- Use the repository's package manager (from its lockfile); don't create a second lockfile.
- Use the repository's language if it is TypeScript, Python, Rust or Go; otherwise TypeScript on Node.js.
- An empty folder: build here. An unrelated folder with important files: use a new child folder.
- A Photon 1.0 integration (see [migrate-from-1.md](migrate-from-1.md)): don't change it. Ask whether to
  build the 2.0 agent in a separate child folder or stop.

If the user needs to approve one plan up front, present it once now, listing what you will install,
create and what (if anything) costs money, then run it without asking again for the steps it named.

## 2. Install or update Photon CLI 3

- `photon --version` prints 3.x: run `photon update --check --json`; if `status` is `"update-available"`,
  run `photon update --json` and check the version again.
- It prints 2.x or lower: that is Photon CLI 1.0. Installing 3 globally with the same package manager
  replaces it (`npm install --global @photon-ai/cli`). Say so before you do it; 1.0 stays available as
  `npx @photon-ai/cli@legacy`. To keep both installed, see [migrate-from-1.md](migrate-from-1.md).
- Not installed: it needs Node.js 22+. Install globally with npm, pnpm or Bun
  (`npm install --global @photon-ai/cli`), or the standalone binary without Node.js
  ([Installation](https://photon.codes/docs/beta/cli/installation.md)). A global install changes the
  user's machine: ask first.

Then `photon --help`. Don't assume a flag exists: check `photon <command> --help`.

## 3. Sign in

```sh
photon whoami --json        # exit 0: signed in, record the account; exit 4: sign in
photon login --json         # prints a link and a code on stderr, then waits
```

Run `photon login` so you can read stderr while it waits (in the background, for example). Give the user
the link and the code and ask them to approve in their browser; never approve it yourself. Add
`--no-browser` when you aren't on the user's own computer. Then run `photon whoami --json` again and check
it is the account they meant.

If `photon auth status --json` shows `"source": "environment"`, a key in `PHOTON_API_TOKEN` is in use and
`photon login` refuses with `AUTH_ENVIRONMENT_KEY_SET`. Ask whether to continue with that key or sign in
as themselves; don't change their environment without asking.

Optional, if the user wants Photon in their AI client too: add the hosted MCP server with the command for
their client ([mcp.md](mcp.md)); they sign in to it in their browser. Then call `getCurrentOrganization`
and `listProjects` to show it works.

## 4. Pick the organization and project

```sh
photon org list --json
photon project current --json
photon project list --org <pho_org_...> --json        # read every page (nextPageToken -> --page-token)
```

- A project ID given by the user or the setup prompt (`pho_prj_...`): use it, and check it with
  `photon project view --project <id> --json`.
- One organization: use it. Several: use `activeOrganizationId` if present, otherwise ask. Never pick by
  name or by which one looks like a test.
- `project current` reports a project from the folder or environment: say which and use it.
- Otherwise list projects. One project: use it. Several: ask. None: create one (ask first).

```sh
photon link --project <pho_prj_...> --json                                   # existing project
photon project create --org <pho_org_...> --name <name> --slug <slug> --link --json   # new project
```

Both write `.photon/project.json` and add `.photon/` to `.gitignore`. The slug is 3 to 63 lowercase
letters, digits and hyphens. From now on pass `--project <pho_prj_...>` on every project command.

## 5. Make iMessage ready

```sh
photon project platform imessage view --project <pho_prj_...> --json
```

Branch on `mode`, not on the plan's name. `"shared"` (Free, Pro) has `maxUserAssignments`;
`"dedicated"` (Business, Enterprise) doesn't use assignments. The plan's name, for the report:
`photon project billing overview --project <id> --json`, `planName` on the subscription whose
`category` is `messaging` (unknown if the account can't read billing; that's not a blocker).

**Shared mode.** Only the assigned person reaches the agent, only in direct conversations, and they must
text first, after the assignment exists.

1. Ask the user for the phone number (E.164, like `+14155551234`) or Apple-account email they will test
   from. It is their own handle, not the agent's. Don't take it from files or old assignments.
2. List assignments, every page: `photon project platform imessage assignment list --project <id> --json`.
   If one's `handle` equals the sender (an email in lowercase), use it; don't create a duplicate.
3. Otherwise, for a phone number, ask, then create it with an idempotency key you keep for retries:

   ```sh
   photon project platform imessage assignment create --project <id> --phone-number <E.164> \
     --idempotency-key imessage-test-sender-<project-id>-<digits> --json
   photon project platform imessage assignment view <assignmentId> --project <id> --json
   ```

   It is usable when the view has no `releasedAt`. If `releasedAt` is set (a reused key can return a
   released assignment), create it again with a new key. The CLI can't create an email assignment: ask
   the user to add the address on the dashboard's iMessage page
   (https://app.beta.photon.codes/project/platforms/imessage), then list again.
4. Record `assignedPhoneNumber`: the number the user texts, and the agent's handle for them.

Errors: `SHARED_LINE_CAP_EXCEEDED` (every seat used: tell the user; release or upgrade only with a yes),
`SHARED_LINE_POOL_EXHAUSTED` (no line free now; report it), `ASSIGNMENT_EXISTS` (list again, use it).

**Dedicated mode.** List lines, every page: `photon project platform imessage list --project <id> --json`.
A usable line has `"imessage"` in `abilities`, `"state": "active"` and
`detail.imessageHealth.overallStatus` `"available"` (`"degraded"`: some features down, ask before using
it; `"unavailable"` or `"unknown"`: don't use). One usable line: use it. Several: ask. Record
`resourceId` and `detail.phoneNumber`. None: check `provisioning` (a running operation can take hours;
don't buy another). Otherwise a new line is $250 per month on Business: buy only after an explicit yes
([channels/imessage.md](channels/imessage.md)). Never fall back to a shared assignment in dedicated mode.

## 6. Create the project API key

The agent's code uses a project API key with `project:read` and `project:write`, nothing more.

- If the env file already has `PHOTON_API_KEY`, read only its ID, never the whole value:
  `sed -n 's/^PHOTON_API_KEY=\(pho_sk_[0-9a-z]\{26\}\)_.*/\1/p' .env.local`. Keep the key if
  `photon project api-key list --project <id> --json` lists that ID, unexpired, with both permissions.
- Otherwise ask once, for example: "May I create a project API key named "imessage-agent" with
  project:read and project:write, expiring on <date 90 days out>? It goes straight into .env.local and I
  won't display it." A yes to anything earlier doesn't cover this.
- Before it is written: the env file must be in `.gitignore`, not tracked by Git, and not a symbolic link.
  The script checks this and refuses otherwise; add the file to `.gitignore` first.

```sh
set -o pipefail
photon project api-key create --project <id> --name imessage-agent \
  --permission project:read --permission project:write \
  --expires-at <RFC 3339, e.g. 2027-03-01T00:00:00Z> --json \
  | node <this skill>/scripts/store-secret.mjs --field secret --key PHOTON_API_KEY --file .env.local
```

Verify without printing the secret: the file has a `PHOTON_API_KEY` line (`grep -c '^PHOTON_API_KEY='`),
and `api-key list` shows the new key's ID with both permissions. If the key was created but the pipe
failed, recover it from the journal:

```sh
photon operation list --status awaiting-output-ack --json
photon operation replay <local-id> --yes --json \
  | node <this skill>/scripts/store-secret.mjs --field secret --key PHOTON_API_KEY --file .env.local
```

Without such a record the secret is gone: revoke that key by its ID and create another (ask again).

If the user would rather create the key themselves, give them
`https://app.beta.photon.codes/project/api-keys/new?name=imessage-agent&expiry=90&permissions=project:read,project:write`,
ask them to select this project first, and to paste the key into the env file, not into chat.

## 7. Configure the env file

Use the repository's env file convention, otherwise `.env.local` in the agent's folder. Keep unrelated
lines.

| Variable | Value |
| --- | --- |
| `PHOTON_PROJECT_ID` | The project ID |
| `PHOTON_API_KEY` | From step 6 (already written by the script) |
| `PHOTON_AGENT_HANDLE` | The agent's number: `assignedPhoneNumber` (shared) or the line's `detail.phoneNumber` (dedicated). Messages to the agent carry it as `receivedBy.handle` |
| `PHOTON_TEST_SENDER` | Shared mode: the assignment's `handle` |
| `PHOTON_WEBHOOK_SECRET` | Webhook delivery only, written by the script ([events.md](events.md#create-a-destination)) |

Check that the env file and `.photon/` are ignored and nothing secret is staged. Report variables by name
and whether they load, never their values.

## 8. Write the agent

Receive with the WebSocket event stream by default (no public URL needed; local development and
long-running workers). Use a webhook when the app already runs on a public HTTPS URL or a serverless
host. If the repository already uses Chat SDK (the `chat` package), use `@photon-ai/chat-adapter`
([chat-sdk.md](chat-sdk.md)). Code and rules for both transports: [events.md](events.md). Install the
client for the language (TypeScript: `@photon-ai/api` and `socket.io-client`).

The agent must:

1. Read `PHOTON_PROJECT_ID` and `PHOTON_API_KEY` from the environment and fail clearly when one is missing.
2. Take the message from each `message.received` event's `data.object`.
3. Answer only a message that is on `imessage`, sent by a human (`sentBy.kind === "human"`), received by
   the agent (`receivedBy.kind === "agent"` and `receivedBy.handle === PHOTON_AGENT_HANDLE`), in a direct
   space (`space.kind === "direct"`), with plain text, and in shared mode from `PHOTON_TEST_SENDER`
   (`sentBy.handle`; compare an email case-insensitively).
4. Reply once with `sendMessage`, reusing `space.id`, `receivedBy.id` and `id`, with the idempotency key
   `reply:<message id>` ([api-and-sdks.md](api-and-sdks.md#reply-to-a-message)). The minimal reply:
   `Photon is connected. You said: <message>`.
5. On the stream: subscribe inside the `connect` handler on every connection with
   `{ startSeq: <saved cursor or 0>, apiVersion: "2026-07-01" }`, check the acknowledgement's
   `apiVersion`, process events one at a time, and save the cursor (with the time it was saved, outside
   Git) only after an event is handled.
6. Know what the stream doesn't replay: on the first start nothing sent before the first acknowledgement
   arrives; replay keeps 7 days, and nothing signals a longer gap. If the saved cursor is older than 7
   days at startup, log it and tell the user; missed messages can still be read with `listMessages`.
7. Log startup, the subscription result, each handled message's ID, `receivedBy.details.type`
   (`shared` or `dedicated`) and the reply outcome with its `requestId`. Never log keys, message text,
   full phone numbers or email addresses.
8. Survive reactions, edits, attachments and unknown payloads without crashing.

For webhooks instead: check that `2026-07-01` is selectable and has `message.received`, ask for the
public HTTPS URL, ask before creating the destination, and pipe its secret into the env file
([events.md](events.md#create-a-destination)).

## 9. Validate and start

Install dependencies with the repository's package manager and run its type check, lint, build or tests.
Fix what the setup broke; report pre-existing failures separately. Before starting, all of these hold:
CLI 3 is current, `whoami` works, the project is chosen and linked, the iMessage mode is known, the
assignment or line is ready, the key is stored and listed with both permissions, the env file is ignored,
and the build passes.

Start it with the repository's own dev or start command (read `package.json` or the build files; don't
guess). Confirm the process stays up, the stream subscription is acknowledged with `ok` and
`apiVersion` `2026-07-01` (this proves the key, project and `project:read`), or with a webhook that
`photon project webhook list --project <id> --json` shows it `enabled`, and that no secret appears in the
logs. If the environment can't keep a process running, start it once, verify, stop it, and give the user
the exact command you verified.

## 10. Ask the user to test, then report

Only after the subscription is acknowledged (or the webhook is enabled):

- Shared: "Send "Hello Photon" from <test sender> to <assignedPhoneNumber>." Remind them to send from
  exactly that phone number or Apple-account email (on iPhone: Settings, Apps, Messages, Send & Receive),
  in a new direct conversation, as an iMessage, not SMS.
- Dedicated: "Send "Hello Photon" to <line number>" from their own phone, never from another Photon line.

Then watch the process: the event arrived, matched, the reply was accepted, and the user confirms it
arrived. If it was accepted but not delivered, follow [debugging.md](debugging.md).

The setup is done only when the agent runs and its subscription or webhook works, and the user has the
number to text. Writing the code is not done. End with a short report:

- **Status**: fully working, running and waiting for a test message, partly done, or blocked (and on what).
- **CLI**: version, whether it was updated, whether 1.0 was replaced.
- **Configuration**: folder, language and package manager, organization, project name and ID, plan if
  known, iMessage mode, the test sender and agent number (or the line), how messages arrive, API key name
  and expiry (not its ID, which looks like a key, and never the key), start command.
- **Changes**: files, dependencies, scripts, and Photon resources created (project, assignment, key,
  webhook, line).
- **Checks**: sign-in, channel, key, build, start and subscription, and inbound and reply if tested.
- **Next**: exactly one action for the user, such as
  `The agent is running. Send "Hello Photon" from +14155551234 to +16282894567.` On a shared iMessage
  line, say why this step comes first: the line can't message anyone first, so the agent can only reply
  after that person texts it.
