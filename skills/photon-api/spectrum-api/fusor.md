<!-- openapi-tag: fusor -->
# Spectrum API: Fusor

Fusor is Spectrum's webhook and event transport used by built-in and custom providers. The management API issues short-lived Fusor authorization material; it does not replace project credentials.

## Current endpoint

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/projects/{projectId}/fusor/token` | Issue a Fusor token for the authenticated project. |

Call the endpoint with project Basic auth. Capture the token and documented TTL or expiry fields from the current response schema. Keep the token server-side, cache it only for its intended lifetime, and refresh before reconnecting a long-lived consumer.

A Fusor token is not a project secret, Dashboard bearer token, iMessage token, or Voice token. Never write it to logs, browser storage, webhook payloads, or committed configuration. If issuance times out ambiguously, reconcile whether the caller can safely request a replacement because short-lived token creation is not a billing or resource-allocation operation.

Official OpenAPI: <https://spectrum.photon.codes/openapi/json>
