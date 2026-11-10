<!-- openapi-tag: users -->
# Spectrum API: users

Users represent end recipients attached to a project. On shared iMessage plans, user creation participates in line assignment; deleting and recreating records can affect routing, so preserve user IDs and inspect existing state before mutating it.

## Current endpoint inventory

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/projects/{projectId}/users/` | List project users. |
| `POST` | `/projects/{projectId}/users/` | Create a project user and perform plan-specific routing/allocation. |
| `GET` | `/projects/{projectId}/users/{userId}/` | Get one project user. |
| `DELETE` | `/projects/{projectId}/users/{userId}/` | Remove a user. |
| `GET` | `/users/{userId}/redirect` | Resolve the current shared-line redirect or link-to-chat destination for that user. |

The create body and returned record are governed by the live `users` OpenAPI tag. Use full E.164 phone numbers and the current required identity/profile fields; do not infer them from SDK `User` properties.

Before creating, list or look up existing users so retries do not create duplicate logical recipients. Before deleting, confirm the exact user and explain that the operation can alter shared-number assignment and access. Never silently recreate a deleted user to work around a routing issue.

Official OpenAPI: <https://spectrum.photon.codes/openapi/json>
