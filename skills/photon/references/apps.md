# Photon Apps

A Photon App lets a service receive events and call the Photon API for every organization that installs it.
Register the App once; each installation has its own approved permissions, project scope and credentials.
Use an App when the user builds a product that other organizations connect. For the user's own project, a
project API key is enough ([api-and-sdks.md](api-and-sdks.md)). Docs:
[Build a Photon App](https://photon.codes/docs/beta/apps/overview.md). Confirm with the user that Apps are
enabled in their environment before testing.

## Who does what

| Actor | Does |
| --- | --- |
| App developer | Registers the App, declares permissions and events, runs the backend |
| Customer organization admin | Installs the App, approves permissions, picks projects in the dashboard |
| Photon | Authenticates the admin, records consent, issues installation credentials, enforces access, signs events |
| App backend | Starts installation, handles the callback, stores credentials, verifies webhooks, calls the API |

## Three credentials, three jobs

| Credential | Scope | Used for | Keep it |
| --- | --- | --- | --- |
| App private key (`.pem`; ES256 when Photon generates it) and key ID | The App | Signing short-lived JWT assertions to create and redeem installation requests | Backend secret store |
| Webhook signing secret (`whsec_...`) | The App, shared by all installations | Verifying events | Backend secret store |
| Installation `clientId` and `clientSecret` | One installation | Getting access tokens for API calls | Encrypted storage keyed by installation ID and your customer |

None of these go in source control, browser code, logs or a per-customer `.env` file. The dashboard has no
self-service rotation for the App signing key or webhook secret: losing one means contacting Photon support.

## Register

[Register an App](https://photon.codes/docs/beta/apps/register.md). In the developer organization:
**Developer > Apps > New app**. Set the name, description, HTTPS callback URL (browser redirect after consent),
requested permissions, event webhook URL (receives signed POSTs) and subscribed events. Request only what the
product uses, for example `organization:read` and `messages:read` with `message.received`; replies also need
`project:write`. Save the App ID (`pho_app_...`), the private key and the webhook secret at creation.

An App can also be described by a manifest on its own domain instead of being registered in the dashboard:
[Publish an App manifest](https://photon.codes/docs/beta/apps/manifest.md).

## Install

[Install an App](https://photon.codes/docs/beta/apps/install.md)

1. In a signed-in session of your product, create a random, expiring `state` bound to that session.
2. `POST /v1/installation-requests` with `appId`, `clientAssertion` (a new JWT: `iss` and `sub` the App ID,
   `aud` the exact endpoint URL, `exp` two minutes, a unique `jti`), `state` and `redirectUri` (exactly the
   registered callback). Redirect the browser to the dashboard's `/organization/install?requestId=...`.
3. The admin approves permissions and chooses all projects or selected projects.
4. On the callback, check the session and `state` (once only), then `POST /v1/installation-requests/redeem`
   with the `code` and a **new** assertion. On `status: "created"`, store `installationId`, `clientId` and
   `clientSecret` before showing success; the secret is returned once. Handle `delivery_consumed`,
   `recovery_required`, `revocation_pending` and `revoked` as the docs describe, and never loop a timed-out
   redemption.
5. Exchange the client credentials for an access token (`grant_type=client_credentials`) at the token
   endpoint Photon gives you for the environment. Never infer that URL or accept one from a user.
6. With that token, call `GET /v1/organizations/current` (needs `organization:read`) and store the verified
   organization ID with your customer account and the `installationId`. The event checks below rely on this
   binding.

## Receive events and reply

[Receive events and call APIs](https://photon.codes/docs/beta/apps/webhooks.md)

- Verify with Standard Webhooks and the App's `whsec_...` secret on the raw body, exactly as for project
  webhooks ([webhooks-and-ws.md](webhooks-and-ws.md#verify-with-standard-webhooks)), and check that the
  event's `id` equals the `webhook-id` header.
- Deliveries carry `app_installation_id`; message events carry `data.organizationId`, `data.projectId` and the
  message in `data.object`. Look up the installation, check the organization matches the one bound to it,
  and resolve your customer from that stored link, never from a query parameter or the body alone.
- Deduplicate on `(app_installation_id, event.id)` atomically with the enqueue, return `2xx`, and work
  asynchronously. Expect retries and out-of-order delivery.
- A webhook response never sends a message. Reply with `POST /v1/projects/{projectId}/messages` using the
  installation's access token and an `Idempotency-Key`, only after an explicit action in your product, and
  only to a sender and Space taken from a validated incoming message.

## Permissions and lifecycle

[Permissions and lifecycle](https://photon.codes/docs/beta/apps/permissions.md)

- An installation is approved permissions plus project scope (`all` includes future projects; `selected`
  only the listed ones). Read it with `GET /v1/installations/current` using installation credentials.
- Raising requested permissions doesn't change existing installations until an admin approves the update.
- Scope selects projects, not channels; filtering channels in your backend happens after data arrives.
- Suspend, resume, uninstall, disable and retire are separate actions. There is no uninstall webhook: when
  Photon rejects an installation's credentials, mark the connection disconnected and stop using them.
