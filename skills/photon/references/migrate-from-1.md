# Photon 1.0 (Spectrum) and moving to 2.0

Photon 1.0 is Spectrum: `spectrum-ts`, Spectrum Cloud projects and secrets, and Photon CLI 1.0. It has its
own skills at https://github.com/photon-hq/skill-legacy. This skill doesn't write 1.0 code. Operations with
similar names in the two versions have different contracts, so never mix packages, hosts, CLI commands
or credentials between them.

## Recognise 1.0

| | Photon 1.0 | Photon 2.0 |
| --- | --- | --- |
| Packages | `spectrum-ts`, `@spectrum-ts/*`, `@photon-ai/advanced-imessage*`, `@photon-ai/imessage-kit`, `@photon-ai/chat-adapter-imessage` | `@photon-ai/api`, `photonhq-api`, `@photon-ai/chat-adapter`, `@photon-ai/mcp` |
| API host | `https://spectrum.photon.codes` | `https://api.photon.codes/v1` |
| Credentials | Project ID and secret with HTTP Basic; `SPECTRUM_PROJECT_ID`, `SPECTRUM_PROJECT_SECRET`, `PHOTON_TOKEN`, `DASHBOARD_TOKEN` | Bearer project API key `pho_sk_`, account service key `pho_ask_`, OAuth tokens |
| Project IDs | Anything not starting with `pho_prj_` | `pho_prj_...` |
| CLI | `@photon-ai/cli` up to 2.3.0 (`legacy` tag): `photon projects ...`, `photon spectrum ...` | `@photon-ai/cli` 3.x: `photon project ...` |
| Docs | Stable pages on photon.codes/docs | Beta pages under photon.codes/docs/beta |

Photon CLI 3 refuses 1.0 work: a 1.0 command exits 2 with `LEGACY_COMMAND`, and a 1.0 credential in the
environment (`PHOTON_TOKEN`, `DASHBOARD_TOKEN`) exits 2 with `LEGACY_TOKEN`. Don't follow the `next` step
those errors give (it points to the 1.0 CLI); for 2.0 work, unset the 1.0 variable only in the shell that
runs `photon`, and leave the user's 1.0 setup alone.

## When you find 1.0 in a project

1. Tell the user what you found and ask what they want: keep 1.0 (use skill-legacy), build 2.0 beside it
   (in a separate folder or module), or move to 2.0.
   If they keep 1.0, don't stop at a pointer: install the matching 1.0 skill and do the task with it, after
   asking as for any install: `npx skills add photon-hq/skill-legacy --skill spectrum` (also `imessage`,
   `chat-adapter-imessage`, `photon-cli`). Without a shell, read it from
   https://github.com/photon-hq/skill-legacy/tree/main/skills.
2. Don't change the 1.0 code or its credentials unless they ask you to migrate.
3. Before moving, check 2.0 covers what they use. On 2.0, iMessage has text, attachments, voice messages,
   replies, read receipts and typing indicators; tapbacks, polls and message effects are 1.0 only for now
   ([Photon](https://photon.codes/docs/beta/photon.md)).

## Moving to 2.0

Nothing carries over automatically: 2.0 has its own projects, lines, keys and events.

1. Create or pick a 2.0 project and make its channel ready ([first-agent.md](first-agent.md)). Shared
   iMessage assignments and dedicated lines are new 2.0 resources with new numbers.
2. Create 2.0 credentials (a project API key, a webhook destination) through the pipe in
   [cli.md](cli.md#commands-that-print-a-secret). 1.0 project secrets don't work on 2.0.
3. Replace the code paths: `spectrum-ts` handlers become a `message.received` consumer
   ([events.md](events.md)) plus `sendMessage` replies ([api-and-sdks.md](api-and-sdks.md)). A Chat SDK
   bot swaps `@photon-ai/chat-adapter-imessage` for `@photon-ai/chat-adapter`
   ([chat-sdk.md](chat-sdk.md#migrating-from-the-10-imessage-adapter)).
4. Use separate state: thread IDs, subscriptions and cursors from 1.0 don't carry over.
5. Test the 2.0 path with a real message before turning the 1.0 one off; ask before turning anything off.

## Keep Photon CLI 1.0 and 3 side by side

Installing 3 globally with the same package manager replaces 1.0
([Migrate from 1.0](https://photon.codes/docs/beta/cli/migrate-from-1.md)). Options:

- Run 1.0 without installing it: `npx @photon-ai/cli@legacy <command>`.
- Run 3 without installing it: `npx -y @photon-ai/cli@latest <command>` wherever a step says `photon`.
- Install the 3 binary into its own folder and leave `PATH` alone. macOS and Linux:
  `curl -fsSL https://github.com/photon-hq/cli/releases/latest/download/install.sh | PHOTON_BIN_DIR="$HOME/.photon-cli-3/bin" PHOTON_NO_MODIFY_PATH=1 sh`,
  then use `~/.photon-cli-3/bin/photon`. Windows (PowerShell):
  `$env:PHOTON_BIN_DIR = "$HOME\.photon-cli-3\bin"; $env:PHOTON_NO_MODIFY_PATH = '1'; irm https://github.com/photon-hq/cli/releases/latest/download/install.ps1 | iex`,
  then use `& "$HOME\.photon-cli-3\bin\photon.exe"`.

`photon update` in 1.0 releases up to 2.2.0 installs 3, because they update from npm's `latest` tag; 2.3.0
stays on 1.0. To keep 1.0, install 2.3.0 (`npm install --global @photon-ai/cli@legacy`) first.
