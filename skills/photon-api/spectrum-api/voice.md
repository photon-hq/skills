<!-- openapi-tag: voice -->
# Spectrum API: Voice

## Endpoint inventory

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/projects/{projectId}/voice/sip-inbound/` | Return active inbound SIP config or `data: null`. Password is never returned; use `hasPassword`. |
| `PATCH` | `/projects/{projectId}/voice/sip-inbound/` | Set or update the public SIP destination and optional digest credentials. |
| `DELETE` | `/projects/{projectId}/voice/sip-inbound/` | Remove inbound routing configuration. |
| `POST` | `/projects/{projectId}/voice/tokens` | Issue one short-lived Voice LightAuth token and `expiresIn`, regardless of shared/dedicated provisioning. |

All calls use project Basic auth. SIP inbound configuration is separate from outbound SIP authentication. Deleting the inbound config stops new inbound routing and requires explicit confirmation.

The SIP password is write-only. Do not assume a blank password in the GET response means no password; inspect `hasPassword`. Store any configured digest secret in a secret manager.

Runtime calls use the SIP configuration described by the Spectrum Voice provider, not the HTTP management API.

Official API pages: <https://photon.codes/docs/api-reference/voice/get-sip-inbound-config> and <https://photon.codes/docs/api-reference/voice/issue-voice-token>
