# Spectrum resources

`photon spectrum` manages the Spectrum resources on a project — **lines**, **users**, **platforms**, the project's **profile**, and its **avatar**. Every subcommand is project-scoped: it resolves the project from `-p/--project`, then `$PHOTON_PROJECT_ID` (see [`environment.md`](./environment.md)). All accept the common `--api-host`, `-t/--token`, and `--json` flags.

> This is the **CLI** that manages Spectrum on a project. For writing message-handling logic, see the separate `spectrum` **SDK** skill in this repo.

## Lines

`photon spectrum lines` — manage phone lines on a project.

| Subcommand | Aliases | What it does |
|---|---|---|
| `list` (default) | `ls` | Table of lines: id, platform, number, status. |
| `add` | `create` | Add a new line. **iMessage only today** (`--platform imessage`, the default). |
| `remove <line-id>` | `rm`, `delete` | Remove a line. Confirms unless `-y/--yes`. |

```bash
photon spectrum lines list          # ← "how many lines do I have?"
photon spectrum lines list --json   # count programmatically
photon spectrum lines add           # add an iMessage line
photon spectrum lines rm <line-id>
```

> **"How many lines do I have?"** → `photon spectrum lines list` (set `$PHOTON_PROJECT_ID` first, or pass `--project`). Use `--json` to count or script it.

> `lines add` only attaches an **iMessage** line and takes no phone number — provisioning/choosing the actual number happens in the dashboard. On the **free tier** you send on a **shared line**, so no line is provisioned to your project and `list` may show none assigned — find your number in the dashboard. A **dedicated line** comes with the **business** tier. See the free-vs-business workflow in [`workflows.md`](./workflows.md#free-vs-business-shared-vs-dedicated-line).

## Users

`photon spectrum users` — manage Spectrum users on a project.

| Subcommand | Aliases | What it does |
|---|---|---|
| `list` (default) | `ls` | Table of users: id, name, email, phone. |
| `add` | `create` | Add a user. Interactive, or pass all four required fields. |
| `remove <user-id>` | `rm`, `delete` | Remove a user. Confirms unless `-y/--yes`. |

`add` flags: `--first-name`, `--last-name`, `--email`, `--phone` (E.164, e.g. `+14155551234`) — all required non-interactively — plus `--invite` to send an onboarding invite.

```bash
photon spectrum users add \
  --first-name Ada --last-name Lovelace \
  --email ada@example.com --phone +14155551234 --invite
```

## Platforms

`photon spectrum platforms` — toggle which platforms are enabled.

| Subcommand | Aliases | What it does |
|---|---|---|
| `list` (default) | `ls` | Each platform and its state (`on`/`off`). |
| `enable <name>` | — | Enable a platform. |
| `disable <name>` | — | Disable a platform. |

```bash
photon spectrum platforms list
photon spectrum platforms enable imessage
```

## Profile

`photon spectrum profile` — the project's Spectrum identity (display name, avatar), distinct from your developer profile in [`commands.md`](./commands.md#profile).

| Subcommand | Aliases | What it does |
|---|---|---|
| `show` (default) | — | Show profile fields (first/last name, avatar URL, …). |
| `update` | `edit` | Update the profile; preserves unset fields. Requires ≥1 field flag. |

`update` flags: `--first-name`, `--last-name`, `--avatar-url` (prefer `spectrum avatar upload` instead).

## Avatar

### `photon spectrum avatar upload <file>`
Upload an image (PNG, JPG, JPEG, WEBP, GIF) as the Spectrum avatar. Uploads via a presigned URL, commits it, and updates the profile to use it.
- `--no-update-profile` — upload only, don't point the profile at the new avatar.

```bash
photon spectrum avatar upload ./logo.png
```
