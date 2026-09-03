# Spectrum resources

`photon spectrum` manages the Spectrum resources attached to one project — its profile, users, phone lines, platform toggles, and avatar. This is the **CLI control plane**; use the separate `spectrum` skill for runtime message-handling logic.

Every command requires an active project. Pass `-p, --project <id>` or set `PHOTON_PROJECT_ID`.

## Project profile

View or update the Spectrum identity attached to the project:

```bash
photon spectrum profile show
photon spectrum profile show --json
photon spectrum profile update --display-name "Support Bot"
```

Alias: `spectrum profile edit`.

Inspect the current profile before applying a write, and update only the fields the user requested. This profile is separate from the developer or organization profile managed by `photon profile`.

## Users

Users identify the people allowed to interact through the project's Spectrum configuration.

### List users

```bash
photon spectrum users ls
photon spectrum users ls --json
```

Alias: `spectrum users list`.

### Add a user

```bash
photon spectrum users add
```

Alias: `spectrum users create`. The installed CLI may prompt for the required fields when they are not supplied as flags.

Normalize phone numbers to E.164 before adding them. Do not put contact details in logs or shell history unnecessarily.

### Remove a user

```bash
photon spectrum users remove <user-id>
```

Aliases: `spectrum users rm`, `spectrum users delete`.

Removing a user is irreversible. The CLI asks for confirmation unless `-y` is passed; confirm the exact user and impact before bypassing it.

## Lines

Lines are phone lines assigned directly to the project. Shared-line plans and dedicated-line plans expose different project-owned resources.

### List lines

```bash
photon spectrum lines ls
photon spectrum lines ls --json
```

Alias: `spectrum lines list`.

An empty project line list does not necessarily mean iMessage is unavailable: a shared sending line may not be owned by the project.

### Add a line

```bash
photon spectrum lines add
```

The current CLI provisions iMessage lines through this command. Inspect the project's plan and current lines first. A dedicated line can have billing and routing implications, so obtain explicit confirmation immediately before creating one.

### Remove a line

```bash
photon spectrum lines remove <line-id>
```

Aliases: `spectrum lines rm`, `spectrum lines delete`.

Line removal can interrupt live traffic and may be irreversible. Confirm the line ID, serving number, and affected deployments before proceeding.

## Platforms

View and toggle messaging platforms for the project.

### List platforms

```bash
photon spectrum platforms ls
photon spectrum platforms ls --json
```

Alias: `spectrum platforms list`.

### Enable a platform

```bash
photon spectrum platforms enable imessage
```

### Disable a platform

```bash
photon spectrum platforms disable telegram
```

Use the platform names returned by current CLI output or `--help`; do not guess from SDK package names. Enabling a platform does not automatically configure every provider credential or external account it needs.

After any change, read the platform list back:

```bash
photon spectrum platforms ls --json
```

## Avatar

Upload an image for the project's Spectrum profile:

```bash
photon spectrum avatar upload ./logo.png
```

The CLI requests a presigned upload URL, uploads the file directly, commits it, and normally updates the Spectrum profile to use it.

```bash
photon spectrum avatar upload ./logo.png --no-update-profile
```

`--no-update-profile` uploads the asset without switching the profile avatar. Validate the local file type and size before upload and do not pass an untrusted path directly from a message.

## Common flags

| Flag | Environment | Description |
|---|---|---|
| `-p, --project <id>` | `PHOTON_PROJECT_ID` | Target project. |
| `--api-host <url>` | `PHOTON_API_HOST` | Override the backend URL. |
| `-t, --token <token>` | `PHOTON_TOKEN` | Use this access token instead of stored credentials. |
| `--json` | — | Machine-readable output where supported. |
| `-y, --yes` | — | Skip a destructive-action confirmation. Use only after explicit authorization. |

## Verification pattern

Use the same sequence for every resource change:

1. Read the current state with `show`, `ls`, or `--json`.
2. Confirm when the write is destructive, paid, or service-affecting.
3. Run the smallest requested mutation.
4. Read the resource back and report the resulting ID and state.
5. Never include access tokens or project secrets in the report.

## See also

- [Photon CLI Spectrum documentation](https://photon.codes/docs/cli/spectrum)
- [`commands.md`](./commands.md) for project, billing, profile, and diagnostic commands
- [`workflows.md`](./workflows.md) for shared vs dedicated lines and end-to-end recipes
- The repository's `spectrum` skill for runtime message and provider code
