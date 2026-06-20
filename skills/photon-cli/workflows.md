# Workflows

End-to-end recipes that combine the commands. For per-command detail see [`commands.md`](./commands.md) and [`spectrum.md`](./spectrum.md); for env vars see [`environment.md`](./environment.md).

## Authenticate + bootstrap a project

The standard "from zero" sequence:

```bash
photon login                          # opens browser, waits for approval
photon whoami                         # confirm you're signed in

photon projects create --name "My App" --platforms imessage
# → ✓ Created My App (proj_abc123) on production

export PHOTON_PROJECT_ID='proj_abc123'   # make it the active project
photon projects show                  # everything below now uses this project
```

A freshly created project is **free**. Nothing is charged at creation.

## Get / rotate the project secret

`projects create` returns the **id**, never the secret. Get a Spectrum API secret one of two ways:

- **Dashboard** — read it from the project's **Settings** page.
- **CLI** — rotate it (printed **once**):

```bash
photon projects regenerate-secret          # or: rotate-secret
# ✓ New secret for proj_abc123:
#   spk_live_…
# ! This is shown once. Store it somewhere safe — re-rotating is the only way to recover.
```

> Rotating **immediately invalidates** the previous secret — any integration still using the old one breaks. Only rotate when you intend to replace it everywhere. Add `--json` to capture `{ id, projectSecret }` programmatically.

## Free vs. business (shared vs. dedicated line)

A project is **free by default** — you get it the moment you run `projects create`. **iMessage works on both tiers** — the free tier is not a trial or a locked state. The difference is *which* line your messages go out on:

- **Free** — you send on a **shared line** pooled across free projects. Because the line isn't dedicated to your project, nothing is provisioned *to* you, so `spectrum lines add` / `list` won't show a line assigned to your project. To see the number you're actually sending from, check the **dashboard**. Staying on the free tier is perfectly fine — upgrade only when you want a line of your own.
- **Business (dedicated line)** — upgrade to the **business** tier to get your **own dedicated line** instead of the shared pool, then confirm the number in the dashboard:

```bash
photon projects upgrade business      # smart-routes to Stripe checkout (or the portal if already subscribed)
# equivalently, the explicit form:
photon billing checkout business
```

`projects upgrade` inspects the current subscription and opens Stripe **checkout** for an unsubscribed project or the **portal** for an already-subscribed one. Force either with `--checkout` / `--manage`. Tiers: `pro`, `business`, `enterprise`.

After upgrading, attach the iMessage line and verify it in the dashboard (the CLI adds the line; the dashboard surfaces the assigned number):

```bash
photon spectrum lines add             # iMessage line
photon spectrum lines list            # confirm
```

## Add an iMessage line

```bash
export PHOTON_PROJECT_ID='proj_abc123'
photon spectrum lines add             # --platform imessage is the default (and only option today)
photon spectrum lines list            # id, platform, number, status
```

## Inspect an existing project

Point the CLI at a project and read its state:

```bash
export PHOTON_PROJECT_ID='proj_abc123'
photon projects show                  # status, location, owner, flags, timestamps
photon spectrum lines list            # how many lines / their numbers + status
photon spectrum platforms list        # which platforms are on
photon billing show                   # current tier + subscription status
```

## Work against a different backend (multi-backend)

Credentials are stored per backend, so you can hold several sessions at once:

```bash
photon login --api-host https://staging.example.com
photon projects ls --api-host https://staging.example.com
photon auth status                    # lists every backend, marks the active one ●
```

Or set it for the whole shell: `export PHOTON_API_HOST=https://staging.example.com`. See [`environment.md`](./environment.md) for the full resolution order.
