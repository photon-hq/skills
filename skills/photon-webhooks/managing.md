# Managing Spectrum webhooks

All operations use HTTP Basic authentication with `projectId` as the username and `projectSecret` as the password. Keep the project secret out of process arguments, logs, and shell history.

## Protected curl credentials

Create a temporary netrc file with restrictive permissions and remove it on exit:

```bash
NETRC=$(mktemp)
chmod 600 "$NETRC"
trap 'rm -f "$NETRC"' EXIT
cat >"$NETRC" <<EOF
machine spectrum.photon.codes
login $PROJECT_ID
password $PROJECT_SECRET
EOF
```

Every example below uses `--netrc-file "$NETRC"`, so the secret is read from the protected file rather than expanded into the `curl` command line.

## Register

```bash
curl --fail-with-body -X POST \
  --netrc-file "$NETRC" \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl":"https://your-app.com/spectrum-webhook"}' \
  "https://spectrum.photon.codes/projects/$PROJECT_ID/webhooks/"
```

`POST /projects/{projectId}/webhooks/` returns registration metadata plus `signingSecret` and `standardSigningSecret`. Both are sensitive and returned only at creation. Save the secret required by the selected verification contract before continuing.

Common errors:

- `422`: malformed or disallowed URL.
- `409`: the same URL is already registered.
- `401`: invalid project credentials.

## List

```bash
curl --fail-with-body \
  --netrc-file "$NETRC" \
  "https://spectrum.photon.codes/projects/$PROJECT_ID/webhooks/"
```

`GET /projects/{projectId}/webhooks/` returns active registrations oldest first. It never returns signing secrets.

## Rotate the standard signing secret

```bash
curl --fail-with-body -X POST \
  --netrc-file "$NETRC" \
  "https://spectrum.photon.codes/projects/$PROJECT_ID/webhooks/$WEBHOOK_ID/secret/rotate"
```

The response returns a new `standardSigningSecret` and `previousValidUntil`. Store and deploy the new secret immediately. During the overlap period, verify against both the new and previous secret; retire the old one after `previousValidUntil`.

Do not log the response body or leave it in a terminal scrollback. Rotation is a credential mutation, so confirm the target webhook before executing it.

## Delete

```bash
curl --fail-with-body -X DELETE \
  --netrc-file "$NETRC" \
  "https://spectrum.photon.codes/projects/$PROJECT_ID/webhooks/$WEBHOOK_ID/"
```

`DELETE /projects/{projectId}/webhooks/{webhookId}/` removes the registration. A missing ID returns `404`. Confirm the exact endpoint and replacement delivery path before deletion.

## Lost secrets

List operations cannot recover either signing secret. Use the rotation endpoint for the standard signing secret. When an integration depends on the legacy `signingSecret` and that value is lost, create a controlled replacement registration if the current API does not expose an in-place legacy-secret rotation.

## Delivery requirements

- The final URL must use HTTPS.
- It must resolve to a public address, not localhost, private, link-local, or cloud-metadata ranges.
- Redirects are fatal; register the final URL directly.
- Persist a new secret before acknowledging setup completion.
- Verify an actual signed delivery after registration or rotation.

Official sources: <https://photon.codes/docs/webhooks/managing-webhooks> and the current Spectrum OpenAPI document.
