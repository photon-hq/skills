<!-- openapi-tag: whatsapp-business -->
# Spectrum API: WhatsApp Business

The current management surface lists connected accounts, issues provider tokens, and manages approved message templates. Runtime sends, media transfer, interactive messages, Flows, and event streams belong in Spectrum or `@photon-ai/whatsapp-business`.

## Current endpoint inventory

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/projects/{projectId}/whatsapp-business/accounts` | List WhatsApp Business accounts connected to the project. |
| `POST` | `/projects/{projectId}/whatsapp-business/tokens` | Issue current WhatsApp Business authorization material. |
| `GET` | `/projects/{projectId}/whatsapp-business/accounts/{accountId}/templates/` | List templates for one connected account. |
| `POST` | `/projects/{projectId}/whatsapp-business/accounts/{accountId}/templates/` | Create or submit a template using the current schema. |
| `PATCH` | `/projects/{projectId}/whatsapp-business/accounts/{accountId}/templates/{templateId}` | Update the supported fields of one template. |
| `DELETE` | `/projects/{projectId}/whatsapp-business/accounts/{accountId}/templates/{templateId}` | Delete one template. |

All calls require project Basic authentication. Account IDs and template IDs are opaque provider resources; do not derive them from display names.

Provider tokens, app credentials, phone-number IDs, and account metadata are sensitive. Keep responses server-side and redact them before logs or error reports. Template creation and updates must match Meta's current category, language, component, and variable rules. Deletion is irreversible from Photon and requires explicit confirmation after showing the account, template name, language, and ID.

Do not use these template routes to bypass Meta approval or the 24-hour free-form messaging window. Use the low-level WhatsApp Business skill to send an already approved template.

Official OpenAPI: <https://spectrum.photon.codes/openapi/json>
