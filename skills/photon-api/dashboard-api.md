# Photon Dashboard API

The Dashboard API manages account-owned projects and implements the CLI device-login flow. Its OpenAPI source is `api-reference/dashboard-openapi.json` in `photon-hq/docs`.

## Endpoint inventory

| Method | Path | Authentication | Purpose |
|---|---|---|---|
| `GET` | `/api/projects/` | Bearer | List projects visible to the signed-in account. |
| `POST` | `/api/projects/` | Bearer | Create a project. |
| `GET` | `/api/projects/{id}` | Bearer | Get one project. |
| `POST` | `/api/auth/device/code` | None | Start RFC 8628-style device authorization. |
| `POST` | `/api/auth/device/token` | None | Poll for approval and receive an authenticated session. |

## Project creation

The current body includes project name plus optional location and product selections documented by the schema. The response project can include `id`, `name`, `location`, platform state, `spectrumProjectId`, and `projectSecret` where the authenticated flow is allowed to expose it.

Treat `projectSecret` as a server credential. Capture it only into a secret store and redact it from output. Do not infer CLI flags directly from OpenAPI field names; the CLI command surface is separately documented.

## Device login

```text
POST /api/auth/device/code
→ device_code, user_code, verification_uri, verification_uri_complete, expires_in, interval

POST /api/auth/device/token
→ 200 JSON: session, user
→ response header: set-auth-token: <bearer token>
```

The successful JSON body does **not** carry the bearer token. Read the `set-auth-token` response header and store that value through the client's normal credential-storage path.

While approval is pending, `POST /api/auth/device/token` can return HTTP `400` with one of:

- `authorization_pending`
- `slow_down`
- `expired_token`
- `access_denied`
- `invalid_request`
- `invalid_grant`

Poll no faster than the returned interval. Increase the delay when the server returns `slow_down`, stop after `expired_token` or `access_denied`, and never request the user's dashboard password. Treat a missing `set-auth-token` header on a nominally successful response as an authentication failure instead of persisting an empty credential.

## Choosing Dashboard API versus CLI

Use the CLI for interactive setup or ordinary scripts. Use the Dashboard API when implementing a custom authenticated client, device-flow integration, or account-level project management. Do not replace the Spectrum Basic-auth project API with a Dashboard bearer token unless the specific OpenAPI operation says so.

Official source: <https://photon.codes/docs/api-reference/dashboard-openapi.json>
