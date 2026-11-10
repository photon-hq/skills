# Deployment and troubleshooting

Start by identifying the selected connection and receiving modes. Most adapter failures come from mixing a cloud credential with a self-hosted transport, mutating a webhook body before verification, or depending on a capability the Chat SDK adapter does not implement.

## Deployment checklist

1. Register the adapter under `new Chat({ userName, adapters: { imessage } })`.
2. Use the scoped `@photon-ai/chat-adapter-imessage` package.
3. Configure exactly one connection path:
   - Spectrum Cloud with a project ID and project secret; or
   - self-hosted Advanced iMessage with a gRPC `host:port` and API key or explicit clients.
4. Configure a signed webhook for serverless receiving or a gateway listener for a long-running process.
5. Keep project secrets, API keys, client tokens, and webhook signing secrets in server-side storage.
6. Make webhook side effects idempotent.
7. Stop gateway listeners during graceful shutdown.
8. Verify the lockfile does not retain the obsolete unscoped adapter unless the project is intentionally maintaining it.

Local on-device mode is not a deployment option for the current adapter. Use the Spectrum local iMessage provider or `@photon-ai/imessage-kit` directly for a Mac-local application.

## Connection failures

### Cloud credentials rejected

- Confirm the project ID and secret belong to the same Photon project.
- Confirm the secret was not rotated after the deployment was configured.
- Check that the credential provider returns `{ projectId, projectSecret }` and does not resolve to empty values.
- Do not expose the secret in browser code to make a server-side connection work.

### Self-hosted connection rejected

- Use `host:port`, not an `https://` URL.
- Confirm the endpoint speaks the current Advanced iMessage gRPC contract.
- Verify the API key or explicit client token and the selected phone routing identity.
- Do not point the adapter at a legacy HTTP or Socket.IO server.

## Webhook failures

### Signature mismatch

Pass the original `Request` to `bot.webhooks.imessage`. A parsed and reserialized body no longer has the exact bytes that Photon signed. Also check the configured signing secret, timestamp freshness, proxy behavior, and server clock.

### Duplicate events

Spectrum delivers at least once. Deduplicate using the delivery and message identifiers and persist accepted work before returning success. Do not treat a retry as a second user action.

### No retry

Return a non-success response only when the delivery should be retried. If the handler acknowledges before durable acceptance, Photon correctly stops retrying even when later application work is lost.

## Capability failures

`fetchMessage` is supported, but message-history pagination and general thread lookup are not. Group operations may require a gateway-observed thread. Treat `NotImplementedError` as a capability boundary and consult [`features-and-limitations.md`](./features-and-limitations.md) before changing transport settings.

## Completion check

A deployment is complete when:

- the adapter initializes without mixing credential modes;
- one receiving path delivers a verified test event;
- duplicate delivery does not repeat side effects;
- a reply reaches a test conversation;
- shutdown clears the gateway listener when one is used; and
- no credential appears in logs, client bundles, or committed files.

See the [current adapter repository](https://github.com/photon-hq/vercel-chat-adapter-imessage) and [Spectrum Webhooks documentation](https://photon.codes/docs/webhooks/overview) for the shipped contracts.
