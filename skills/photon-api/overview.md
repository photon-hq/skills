# Photon HTTP API overview

Use Photon OAuth when a third-party application needs scoped access on behalf of a user. Use the Spectrum API for project-scoped management operations over HTTPS. Use the Dashboard API for authenticated account/project administration and device login. Runtime messaging belongs in Spectrum or a low-level platform SDK; the management APIs are not a general HTTP send-message transport.

## Hosts and authentication

| Surface | Base | Authentication |
|---|---|---|
| Photon OAuth / Dashboard API | `https://app.photon.codes` | OAuth bearer access token or the documented device-login token flow |
| Spectrum API | `https://spectrum.photon.codes` | HTTP Basic with project ID as username and project secret as password |

OAuth access tokens represent a consenting user and are limited by scopes. Spectrum project credentials authorize one project. Do not send one credential type to the other host.

```bash
curl --fail-with-body \
  --user "$PHOTON_PROJECT_ID:$PHOTON_PROJECT_SECRET" \
  "https://spectrum.photon.codes/projects/$PHOTON_PROJECT_ID/platforms/"
```

Keep credentials in a server-side secret store. Do not expose them in browser JavaScript, URLs, shell history, logs, or committed files.

## Response envelope

Most Spectrum API responses use:

```json
{
  "succeed": true,
  "data": {}
}
```

On failure, treat HTTP status as authoritative and preserve the server error payload for diagnostics after redacting credentials. Do not assume an error response has the success envelope.

## Rate limit and retries

The default documented Spectrum API limit is five requests per second per project. Handle `429` with bounded exponential backoff and jitter. Retry only idempotent reads or writes carrying a documented idempotency mechanism. Never automatically retry a purchase, subscription mutation, line allocation/removal, project deletion, or secret rotation.

## Current schema discovery

Before constructing an uncommon request, inspect the live OpenAPI rather than inferring a path from the CLI:

```bash
curl -fsSL https://spectrum.photon.codes/openapi/json > /tmp/spectrum-openapi.json
curl -fsSL https://photon.codes/docs/api-reference/dashboard-openapi.json > /tmp/dashboard-openapi.json
```

The repository CI checks that every current OpenAPI tag has one owning skill file. Category files document stable operations and security boundaries; the live schema remains authoritative for uncommon request and response fields.

For user-consent integrations, read [`oauth.md`](./oauth.md) before choosing scopes, redirect URIs, token storage, or discovery URLs.

Official sources: <https://photon.codes/docs/api-reference/introduction>, <https://photon.codes/docs/api-reference/oauth>, and <https://photon.codes/docs/api-reference/rate-limit>
