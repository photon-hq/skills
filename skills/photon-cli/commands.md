# Command reference

Every command in the `photon` CLI except the `spectrum` group, which has its own file: [`spectrum.md`](./spectrum.md). For environment variables and resolution order, see [`environment.md`](./environment.md).

Run `photon <command> --help` before scripting an uncommon flag. Root flags such as `--debug` belong on the root command; command-specific flags belong after the subcommand.

## Command tree

```text
photon
├── ping
├── env current
├── login
├── logout
├── whoami
├── auth status
├── config show
├── profile
│   ├── show
│   ├── init
│   └── update
├── projects
│   ├── ls
│   ├── show
│   ├── create
│   ├── update
│   ├── delete
│   ├── regenerate-secret
│   ├── open
│   ├── upgrade
│   └── check-phone
├── spectrum
│   ├── profile show | update
│   ├── users ls | add | remove
│   ├── lines ls | add | remove
│   ├── platforms ls | enable | disable
│   └── avatar upload
└── billing
    ├── plans
    ├── show
    ├── checkout
    └── manage
```

## Common flags

These appear on most project-scoped or authenticated commands:

| Flag | Environment | Meaning |
|---|---|---|
| `--api-host <url>` | `PHOTON_API_HOST` | Target backend; defaults to `https://app.photon.codes`. |
| `-t, --token <token>` | `PHOTON_TOKEN` | Use this access token instead of stored credentials. |
| `-p, --project <id>` | `PHOTON_PROJECT_ID` | Target project for project-scoped commands. |
| `--json` | — | Machine-readable output where supported; browser flows return a URL instead of opening it. |
| `-y, --yes` | — | Skip a destructive-action confirmation. Use only after explicit authorization. |
| `--no-browser` | — | Print a URL instead of opening the default browser. |

Root-level flags:

| Flag | Environment | Meaning |
|---|---|---|
| `--debug` | `PHOTON_DEBUG=1` | Verbose request and response logs to stderr. Verify secrets remain redacted before sharing logs. |
| `--version`, `-v` | — | Print the CLI version. |
| `--no-color` | `NO_COLOR=1` | Disable colored output. |

## Diagnostics

### `photon ping`

Hit the Dashboard health endpoint and print the result. Use `-u` or `--url` to test an arbitrary URL without normal backend resolution:

```bash
photon ping
photon ping -u https://custom.example.com
```

### `photon env current`

Show the backend the next command will target:

```bash
photon env current
```

### `photon config show`

Print active configuration without secrets — config directory, selected backend, active project, and relevant environment resolution:

```bash
photon config show
photon config show --json
```

## Authentication

### `photon login`

Start the device-authorization flow. The user approves in a browser; the CLI stores a token for the selected backend.

```bash
photon login
photon login --no-browser
photon login --api-host https://staging-app.photon.codes --no-browser
```

### `photon logout`

Revoke the active backend session and remove its local credential file:

```bash
photon logout
```

### `photon whoami`

Show the user authenticated for the selected backend:

```bash
photon whoami
photon whoami --json
```

### `photon auth status`

Show credential status across every backend stored on the machine:

```bash
photon auth status
photon auth status --json
```

## Profile

The `photon profile` group manages the developer or organization profile, which is separate from a project's Spectrum profile.

### `photon profile show`

```bash
photon profile show
photon profile show --json
```

### `photon profile init`

Create the profile interactively or pass the fields supported by the installed CLI:

```bash
photon profile init
```

### `photon profile update`

Update selected fields and preserve the others:

```bash
photon profile update --display-name "Jane Doe"
```

Alias: `profile edit`.

## Projects

`photon projects` manages top-level Photon projects.

### List and show

```bash
photon projects ls
photon projects ls --json
photon projects show
photon projects show <project-id> --json
```

Aliases: `projects list`, `project ls`, and `projects get`.

### Create

Without flags, `create` opens an interactive flow. For scripts and agents, pass the values directly:

```bash
photon projects create \
  --name "My Project" \
  --location us-east \
  --spectrum \
  --json
```

| Flag | Meaning |
|---|---|
| `--name <name>` | Project name. |
| `--location <location>` | Deployment region accepted by the current backend. |
| `--spectrum` | Enable Spectrum for the project. |

Alias: `projects new`.

### Update

```bash
photon projects update <project-id> --name "New Name"
```

Aliases: `projects edit`, `projects set`.

### Delete

```bash
photon projects delete <project-id>
photon projects delete <project-id> -y
```

Deletion is permanent. Confirm the exact project and impact before using `-y`. Aliases: `projects rm`, `projects remove`.

### Rotate the Spectrum project secret

```bash
photon projects regenerate-secret <project-id>
photon projects regenerate-secret -y
```

This **rotates** the credential and invalidates the old value immediately. It is not a read-only secret command. Inventory every deployment using the old secret and confirm before running it.

Alias: `projects rotate-secret`.

### Open the project

```bash
photon projects open
photon projects open <project-id>
photon projects open --no-browser
```

### Upgrade a subscription

`projects upgrade` inspects the current subscription and routes the user to Checkout or the Stripe Portal:

```bash
photon projects upgrade
photon projects upgrade pro
photon projects upgrade <project-id> business
photon projects upgrade business --qty 5
photon projects upgrade --checkout
photon projects upgrade --manage
photon projects upgrade --plan price_xxx
photon projects upgrade --no-browser --json
```

Available tiers are `pro`, `business`, and `enterprise`.

| Flag | Meaning |
|---|---|
| `[tier]` | Positional tier; skips the interactive picker. |
| `--plan <price-id>` | Explicit Stripe price ID. |
| `--qty <number>` | Checkout quantity. |
| `--checkout` | Force Checkout. |
| `--manage` | Force the Stripe Portal; takes precedence over tier, plan, and checkout. |
| `--no-browser` | Print the destination URL. |
| `--json` | Return `{ action, url, tier? }`. |

Any paid action or subscription change requires explicit user confirmation.

### Check phone-number availability

```bash
photon projects check-phone +15551234567
```

## Billing

The `photon billing` group requires an active project.

### List plans

```bash
photon billing plans
```

### Show the current subscription

```bash
photon billing show
photon billing show --json
```

### Start Checkout

```bash
photon billing checkout
photon billing checkout pro
photon billing checkout business --qty 5
photon billing checkout --plan price_xxx --no-browser --json
```

Without a tier or price ID, the CLI opens an interactive plan picker. Checkout spends money; present the exact tier and quantity and obtain confirmation first.

### Open the Stripe Portal

```bash
photon billing manage
photon billing manage --no-browser
```

Alias: `billing portal`. The Portal handles payment methods, plan changes, invoices, downgrades, and cancellation.

## Spectrum resources

Use the dedicated [`spectrum.md`](./spectrum.md) reference for the project Spectrum profile, users, lines, platforms, and avatar upload.

## See also

- [Photon CLI overview](https://photon.codes/docs/cli/overview)
- [Photon CLI projects](https://photon.codes/docs/cli/projects)
- [Photon CLI billing](https://photon.codes/docs/cli/billing)
- [Photon CLI profile and utilities](https://photon.codes/docs/cli/profile-and-utilities)
