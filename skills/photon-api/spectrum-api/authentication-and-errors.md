# Spectrum API authentication and errors

## Basic authentication

Every project-scoped operation documents:

```http
Authorization: Basic base64(projectId:projectSecret)
```

```bash
curl --user "$PROJECT_ID:$PROJECT_SECRET" \
  "https://spectrum.photon.codes/projects/$PROJECT_ID/platforms/"
```

The project ID is the Basic username and the project secret is the password. Do not confuse these with Dashboard bearer tokens or short-lived iMessage, Fusor, or Voice LightAuth tokens.

## Standard handling

```ts
const response = await fetch(url, {
  method,
  headers: {
    authorization: `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString("base64")}`,
    "content-type": "application/json",
  },
  body: body === undefined ? undefined : JSON.stringify(body),
  signal,
});

const payload = await response.json().catch(() => undefined);
if (!response.ok) {
  throw new SpectrumApiError(response.status, payload);
}
```

Common classes of response:

- `400` malformed request;
- `401` missing or invalid project credentials;
- `404` project/resource not found;
- `409` current state conflicts with the requested mutation;
- `422` semantically invalid input;
- `429` project rate limit exceeded;
- `5xx` transient service failure.

Use the live operation page for exact status contracts. Retry `429` and transient `5xx` only with bounded backoff. Do not retry non-idempotent billing or destructive actions automatically.

## Credential lifecycle

Project-secret rotation invalidates the previous value immediately. Require explicit intent, inventory every deployment using it, update all secret stores, and verify integrations after rollout. Do not rotate a secret simply to read it.

Short-lived token endpoints such as iMessage, Fusor, and Voice return their own TTL. Cache only for the documented lifetime and never treat them as project secrets.

Official source: <https://photon.codes/docs/api-reference/introduction>
