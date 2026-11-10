<!-- openapi-tag: slack -->
# Spectrum API: Slack

## Endpoint inventory

The current Slack tag includes:

- `POST` Issue Slack tokens.
- `GET` Get Slack app config.
- `PUT` Upsert Slack app config.
- `DELETE` Delete Slack app config.
- `GET /projects/{projectId}/slack/installations` List installations.
- `PUT` Upsert an installation.
- `DELETE` Delete an installation.
- `POST` Set up the project's Slack app through workspace-admin tokens.

Before implementing any operation other than the documented list path, extract the exact current paths and request schema from OpenAPI; Slack OAuth and admin-token contracts can change.

> **Plaintext-token warning:** installation list responses contain `botToken`, `botRefreshToken`, and expiry data. Call only from a trusted server. Do not return the raw response to a browser, log it, persist it unnecessarily, or attach it to support tickets.

Deleting an app config or installation can interrupt event delivery and message sends. Require confirmation and inspect active installations before deletion. Upserts must preserve required scopes and current app identity.

Official API page: <https://photon.codes/docs/api-reference/slack/list-slack-installations-for-project>
