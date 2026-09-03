<!-- openapi-tag: lines -->
# Spectrum API: dedicated lines

## Endpoint inventory

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/projects/{projectId}/lines/` | List project-owned dedicated lines; optional `platform` filter supports `imessage`, `whatsapp_business`, `voice`, or `slack`. |
| `POST` | `/projects/{projectId}/lines/` | Allocate a Business-plan dedicated iMessage line and update subscription quantity/proration. Body platform is currently `imessage`. |
| `GET` | `/projects/{projectId}/lines/route` | Route a new user to the healthiest dedicated iMessage line. |
| `GET` | `/projects/{projectId}/lines/{lineId}/profile` | Get line profile. |
| `PATCH` | `/projects/{projectId}/lines/{lineId}/profile` | Update line first/last name fields. |
| `POST` | `/projects/{projectId}/lines/{lineId}/profile/avatar/upload` | Obtain a presigned avatar upload URL and storage key. |
| `POST` | `/projects/{projectId}/lines/{lineId}/profile/avatar` | Commit an uploaded avatar key to the line profile. |
| `DELETE` | `/projects/{projectId}/lines/{lineId}` | Deallocate a line. iMessage removal adjusts subscription quantity and proration; WhatsApp removal returns `billing: null`. |

`GET /lines/` does not represent shared Free/Pro assignments. For shared users, use user redirect/routing operations.

## Consequential operations

Adding or removing a line can immediately change billing and service capacity. Show the project, plan, current line inventory, and expected mutation, then obtain explicit confirmation immediately before `POST /lines/` or `DELETE /lines/{lineId}`. Do not auto-retry either operation after an ambiguous timeout; reconcile line and billing state first.

Avatar upload is two phase: request URL, upload bytes to the returned URL, then commit the returned key. Never expose project credentials to the upload client; only the presigned URL should leave the trusted server.

Official API section: <https://photon.codes/docs/api-reference/lines/list-project-lines>
