# Workflows

End-to-end recipes that combine the commands. For per-command detail see [`commands.md`](./commands.md) and [`spectrum.md`](./spectrum.md); for environment variables and resolution rules see [`environment.md`](./environment.md).

Every workflow ends with a non-destructive verification. Do not rotate credentials, delete resources, remove lines, change a subscription, or open checkout without the user's explicit authorization.

## Authenticate + bootstrap a project

The standard "from zero" sequence:

```bash
photon --version || npm install -g @photon-ai/cli

photon whoami --json || photon login --no-browser
# Login may require the user to approve the browser request.

PROJECT_ID=$(photon projects create \
  --name "My App" \
  --location us-east \
  --spectrum \
  --json | jq -r '.id')

export PHOTON_PROJECT_ID="$PROJECT_ID"
photon projects show --json
photon spectrum profile show --json
```

A newly created project starts on the free path; project creation itself does not open checkout. It also does not guarantee that a dedicated iMessage line is assigned. Inspect plan and resource state separately.

## Inspect a project before changing it

Read the current state first:

```bash
photon projects show --json
photon spectrum profile show --json
photon spectrum users ls --json
photon spectrum lines ls --json
photon spectrum platforms ls --json
photon billing show --json
```

Use that inventory to decide whether the requested write is needed. A shared-line project may not show a project-owned line, so an empty `lines ls` result does not by itself mean project creation failed.

## Retrieve or rotate project credentials

Retrieve the project's current Spectrum credentials through `photon projects show` or the project's Dashboard page. Store the secret in an ignored environment file or secret manager and never print it in the final response.

`projects regenerate-secret` is not a read operation. It replaces the project secret and invalidates the previous value immediately:

```bash
# Run only after explicit confirmation and a rollout plan.
photon projects regenerate-secret <project-id>
```

A safe rotation procedure is:

1. Confirm that the user intends to invalidate the current credential.
2. Inventory every deployment and secret store that uses it.
3. Prepare the rollout and rollback path.
4. Run `photon projects regenerate-secret <project-id>`.
5. Capture the new value without logging it.
6. Update every secret store and redeploy.
7. Verify each integration with a read-only SDK or API operation.

Do not rotate merely because an agent needs to discover the current secret.

## Free vs business: shared vs dedicated lines

A project can use iMessage on the free shared path or upgrade for a project-owned dedicated line.

- **Shared line** — the sending line comes from a shared pool and may not appear as a line owned by the project. Recipients and proactive messaging can have additional restrictions.
- **Dedicated line** — a Business project owns its line and can use dedicated-line features such as cloud group creation and stable per-project routing.

Inspect the current subscription before proposing an upgrade:

```bash
photon billing plans
photon billing show --json
```

After the user confirms the exact tier, quantity, and paid action, create the Checkout or Portal URL:

```bash
photon projects upgrade business --qty 1 --no-browser --json
# or use the explicit billing command:
photon billing checkout business --qty 1 --no-browser --json
```

`projects upgrade` routes an unsubscribed project to Checkout and an existing subscription to the Stripe Portal unless a flow is forced. Downgrades, cancellation, payment-method changes, and other subscription management happen through the Portal.

Creating a URL does not prove the user completed the billing action. After they finish Checkout or the Portal flow, read the authoritative state back before reporting success:

```bash
photon billing show --json
photon spectrum lines ls --json
```

Report the returned subscription status and line state. Do not claim that the tier changed merely because the CLI returned an `action` and `url`.

## Add or inspect an iMessage line

Inspect before writing:

```bash
photon spectrum lines ls --json
```

After the user has the correct plan and explicitly requests a line:

```bash
photon spectrum lines add
photon spectrum lines ls --json
```

Removing a line is destructive and can break active traffic. Confirm the exact line ID and impact before running `photon spectrum lines remove <line-id>`.

## Enable a platform

```bash
photon spectrum platforms ls --json
photon spectrum platforms enable imessage
photon spectrum platforms ls --json
```

Use the same inspect → change → verify sequence for other supported platforms. Do not assume a platform being enabled also provisions its external credentials or resources.

## CI authentication

Use a token and project ID from the CI platform's secret and variable stores:

```bash
PHOTON_TOKEN="$PHOTON_TOKEN" \
PHOTON_PROJECT_ID="$PHOTON_PROJECT_ID" \
photon projects show --json
```

Then run the minimum read-only verification required by the workflow. The device-flow token currently has a default seven-day lifetime, so CI needs a reauthentication path when it expires.

Never print the token, project secret, or credentials file in CI logs or artifacts.

## Work against a different backend

Credentials are stored per backend, so several sessions can coexist:

```bash
photon login \
  --api-host https://staging-app.photon.codes \
  --no-browser

photon projects ls \
  --api-host https://staging-app.photon.codes \
  --json

photon auth status --json
```

Or set the backend for the shell:

```bash
export PHOTON_API_HOST=https://staging-app.photon.codes
photon env current
photon whoami
```

When authentication unexpectedly fails, verify that `login`, `whoami`, and the target command all resolve to the same backend before replacing credentials.

## Troubleshoot unauthorized or project-not-found

Check the state in this order:

1. Run `photon env current`.
2. Run `photon whoami` against the same backend.
3. Check the `--project` argument and `PHOTON_PROJECT_ID` precedence.
4. Inspect `photon config show --json`; it does not print secrets.
5. Verify project membership with `photon projects ls --json`.
6. Reauthenticate only when the session is expired or revoked.

Do not create a replacement project until the backend, identity, and project mismatch is understood.

## See also

- [Photon CLI authentication](https://photon.codes/docs/cli/authentication)
- [Photon CLI projects](https://photon.codes/docs/cli/projects)
- [Photon CLI Spectrum resources](https://photon.codes/docs/cli/spectrum)
- [Photon CLI billing](https://photon.codes/docs/cli/billing)
