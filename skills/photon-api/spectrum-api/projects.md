<!-- openapi-tag: projects -->
# Spectrum API: projects

The Spectrum `projects` tag manages the project record, public profile, slug, profile synchronization, and avatar upload. Account-wide project creation and listing belong to the Dashboard API.

## Current endpoint inventory

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/projects/{projectId}/` | Get the Spectrum project record. |
| `GET` | `/projects/{projectId}/profile` | Read the project's public Spectrum profile. |
| `PATCH` | `/projects/{projectId}/profile` | Update supported public profile fields. |
| `GET` | `/projects/{projectId}/profile/sync` | Inspect current profile synchronization state. |
| `POST` | `/projects/{projectId}/profile/sync` | Trigger profile synchronization to the configured platform resources. |
| `POST` | `/projects/{projectId}/profile/avatar/upload` | Request a presigned avatar upload URL and storage key. |
| `POST` | `/projects/{projectId}/profile/avatar/commit` | Commit the uploaded avatar key to the project profile. |
| `PATCH` | `/projects/{projectId}/slug/` | Update the project slug using the current schema. |

All operations require project Basic authentication. These endpoints do not create or delete Dashboard projects and do not rotate the project secret.

Avatar writes are two phase: request the presigned upload, upload the bytes without exposing project credentials, then commit the returned key. After any profile or slug write, use the corresponding `GET` operation to verify state. Profile synchronization can fan out to external platform state, so do not repeatedly trigger it after an ambiguous timeout without first inspecting sync status.

Official OpenAPI: <https://spectrum.photon.codes/openapi/json>
