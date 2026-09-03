---
name: photon-api
description: >
  Build or review integrations against Photon's HTTP APIs and OpenAPI documents. Use for OAuth 2.1 user
  authorization, the Dashboard API, the Spectrum API, projects, users, billing, Fusor, iMessage configuration,
  lines, platforms, Voice, webhooks, WhatsApp Business, Slack, curl, generated clients, and non-TypeScript automation.
  Do not use this skill as a substitute for the runtime Spectrum SDK.
license: MIT
metadata:
  author: photon-hq
  version: '1.1.0'
---

# Photon HTTP APIs

Photon exposes separate HTTP surfaces for user-authorized Dashboard operations and project-scoped Spectrum administration. Choose the surface and credential type before constructing a request.

## Choose the API

| Need | Use | Authentication |
|---|---|---|
| Runtime agent and messaging logic | Spectrum SDK | Spectrum project credentials through the SDK |
| Interactive or scripted terminal administration | Photon CLI | Stored device-session token or `PHOTON_TOKEN` |
| A third-party application acting for a Photon user | Photon OAuth + Dashboard API | OAuth 2.1 bearer token with the required scopes |
| Project-scoped management over HTTPS | Spectrum API | HTTP Basic with project ID and project secret |
| Signed inbound HTTP event delivery | Spectrum Webhooks | Per-webhook signing secret for verification |
| Direct platform behavior not exposed by Spectrum | Low-level platform SDK | The selected SDK's credential contract |

OAuth bearer tokens for `app.photon.codes` and Spectrum project credentials for `spectrum.photon.codes` are separate and not interchangeable. The Spectrum API is a management surface, not a general public send-message endpoint.

## Credential boundary

Before completing an API integration:

- Keep project secrets, OAuth client secrets, access tokens, refresh tokens, and webhook signing secrets out of browser code, URLs, logs, shell history, and committed files.
- Use PKCE with `S256` for every OAuth authorization-code flow.
- Request only the scopes the application needs and handle shorter access-token lifetimes for write scopes.
- Treat the live OpenAPI document as authoritative for uncommon paths, fields, and response shapes.
- Handle `429` responses with bounded backoff and retry only operations that are safe to repeat.
- Confirm before purchases, subscription mutations, project deletion, line removal, or secret rotation.

A typical Spectrum API request uses project-scoped HTTP Basic authentication:

```bash
curl --fail-with-body \
  --user "$PHOTON_PROJECT_ID:$PHOTON_PROJECT_SECRET" \
  "https://spectrum.photon.codes/projects/$PHOTON_PROJECT_ID/webhooks/"
```

## How this skill is organized

Each topic lives in its own file in this directory. Read the file relevant to the user's question.

| File | When to consult |
|---|---|
| [`overview.md`](./overview.md) | API hosts, authentication boundaries, response envelopes, rate limits, retries, and live schema discovery. |
| [`oauth.md`](./oauth.md) | OAuth 2.1 and OpenID Connect, discovery, app registration, PKCE, scopes, refresh-token rotation, revocation, and limitations. |
| [`dashboard-api.md`](./dashboard-api.md) | User-authorized project operations and the current Dashboard OpenAPI document. |
| [`spectrum-api/authentication-and-errors.md`](./spectrum-api/authentication-and-errors.md) | Project credentials, HTTP Basic, error envelopes, redaction, rate limits, and retry rules. |
| [`spectrum-api/users.md`](./spectrum-api/users.md) | Spectrum project users and invitation or removal boundaries. |
| [`spectrum-api/projects.md`](./spectrum-api/projects.md) | Project-scoped Spectrum settings and destructive project operations. |
| [`spectrum-api/billing.md`](./spectrum-api/billing.md) | Plans, subscriptions, checkout, and paid-action confirmation. |
| [`spectrum-api/fusor.md`](./spectrum-api/fusor.md) | Fusor resources and their current management endpoints. |
| [`spectrum-api/imessage.md`](./spectrum-api/imessage.md) | iMessage-specific project configuration exposed by the management API. |
| [`spectrum-api/lines.md`](./spectrum-api/lines.md) | Line listing, allocation, removal, ownership, and plan constraints. |
| [`spectrum-api/platforms.md`](./spectrum-api/platforms.md) | Enabling, disabling, and inspecting Spectrum platforms. |
| [`spectrum-api/voice.md`](./spectrum-api/voice.md) | Voice and SIP management operations. |
| [`spectrum-api/webhooks.md`](./spectrum-api/webhooks.md) | Webhook registration, listing, deletion, and one-time secret handling. |
| [`spectrum-api/whatsapp-business.md`](./spectrum-api/whatsapp-business.md) | WhatsApp Business project credentials and configuration. |
| [`spectrum-api/slack.md`](./spectrum-api/slack.md) | Slack installations, tokens, and configuration returned by the API. |

## See also

- [Photon API introduction](https://photon.codes/docs/api-reference/introduction)
- [Photon OAuth documentation](https://photon.codes/docs/api-reference/oauth)
- [Dashboard OpenAPI](https://photon.codes/docs/api-reference/dashboard-openapi.json)
- [Spectrum OpenAPI](https://spectrum.photon.codes/openapi/json)
- The `photon-cli` skill for terminal administration
- The `spectrum` skill for runtime messaging and agent behavior
