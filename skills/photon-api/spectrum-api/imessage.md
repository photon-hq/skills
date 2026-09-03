<!-- openapi-tag: imessage -->
# Spectrum API: iMessage

## Endpoint inventory

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/projects/{projectId}/imessage/tokens` | Issue current iMessage LightAuth credentials. Dedicated projects receive maps keyed by instance ID; shared projects receive one token. The response includes `expiresIn`. |
| `GET` | `/projects/{projectId}/imessage/` | Return whether the project's iMessage service is shared or dedicated. |
| `GET` | `/projects/{projectId}/imessage/shared/availability` | Check whether a shared number can be assigned for the required `phoneNumber` query. |

All require Basic project authentication.

The availability check mirrors shared-user allocation rules, including reuse of a soft-deleted user's prior assignment in the same project. `available: false` means no reusable slot exists and every shared number is already globally assigned for that phone.

Token responses are secret-bearing and short lived. Cache according to `expiresIn`, never return them to untrusted browser clients, and do not persist beyond operational need.

For runtime messaging, use Spectrum or current Advanced iMessage rather than calling these management endpoints as a send API.

Official API pages: <https://photon.codes/docs/api-reference/imessage/issue-imessage-tokens>, <https://photon.codes/docs/api-reference/imessage/get-imessage-info>, and <https://photon.codes/docs/api-reference/imessage/check-shared-phone-number-availability>
