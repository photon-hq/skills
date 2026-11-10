<!-- openapi-tag: platforms -->
# Spectrum API: platforms

## Endpoint inventory

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/projects/{projectId}/platforms/` | Return enabled state and retained metadata for `imessage`, `whatsapp_business`, `voice`, and `slack`. |
| `PATCH` | `/projects/{projectId}/platforms/` | Toggle a platform's enabled state. |
| `PATCH` | `/projects/{projectId}/platforms/{platform}` | Update enabled platform metadata, currently including iMessage `autoScale`; returns `409` when the platform is disabled. |

Platform metadata is preserved across disable/enable cycles. Do not interpret disabled as deleted configuration.

```bash
curl --user "$PROJECT_ID:$PROJECT_SECRET" \
  "https://spectrum.photon.codes/projects/$PROJECT_ID/platforms/"
```

Before changing state, fetch current configuration and verify the project has the required line, provider credentials, or subscription. Disabling an active production platform is consequential and requires confirmation.

Official API pages: <https://photon.codes/docs/api-reference/platforms/get-platforms> and <https://photon.codes/docs/api-reference/platforms/update-platform-metadata>
