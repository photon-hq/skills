<!-- openapi-tag: webhooks -->
# Spectrum API: webhooks

## Endpoint inventory

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/projects/{projectId}/webhooks/` | List registrations oldest first. Signing secrets are omitted. |
| `POST` | `/projects/{projectId}/webhooks/` | Register a public HTTPS URL. Returns both signing-secret formats once. |
| `POST` | `/projects/{projectId}/webhooks/{webhookId}/secret/rotate` | Rotate the standard signing secret and return its overlap deadline. |
| `DELETE` | `/projects/{projectId}/webhooks/{webhookId}/` | Delete a registration. |

Use a protected netrc file so the project secret does not appear in process arguments:

```bash
NETRC=$(mktemp)
chmod 600 "$NETRC"
trap 'rm -f "$NETRC"' EXIT
cat >"$NETRC" <<EOF
machine spectrum.photon.codes
login $PROJECT_ID
password $PROJECT_SECRET
EOF

curl --fail-with-body \
  --netrc-file "$NETRC" \
  "https://spectrum.photon.codes/projects/$PROJECT_ID/webhooks/"
```

Registration rejects malformed URLs, duplicates, plain HTTP, redirects, private/link-local/metadata addresses, and unreachable destinations according to the current webhook policy.

A successful registration returns both:

- `signingSecret` — the legacy Photon signature secret where that compatibility field is still exposed.
- `standardSigningSecret` — the standard Spectrum webhook signing secret used by the current verification contract.

Both values are sensitive and are returned only at creation. Persist the required secret immediately; list responses cannot recover either value.

## Rotate the standard signing secret

Rotate in place instead of deleting the registration:

```text
POST /projects/{projectId}/webhooks/{webhookId}/secret/rotate
→ standardSigningSecret
→ previousValidUntil
```

Store the new `standardSigningSecret`, deploy it, and accept both the old and new secret until `previousValidUntil`. Remove the old secret after the overlap window. A rotation changes credentials for the existing webhook registration; it does not create a second URL.

Use the separate `photon-webhooks` skill for signature verification, overlap handling, delivery retries, idempotency, and event payloads.

Official API source: the current Spectrum OpenAPI document at <https://spectrum.photon.codes/openapi/json>.
