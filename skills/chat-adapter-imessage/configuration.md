# Configuration

`createiMessageAdapter(options)` supports two current connection modes: Spectrum Cloud and a self-hosted Advanced iMessage gRPC endpoint. Select one credential set and keep it consistent throughout the application.

## Spectrum Cloud

Pass project credentials directly or let the adapter resolve `IMESSAGE_PROJECT_ID` and `IMESSAGE_PROJECT_SECRET` from the environment.

```ts
import { createiMessageAdapter } from "@photon-ai/chat-adapter-imessage";

const adapter = createiMessageAdapter({
  projectId: process.env.IMESSAGE_PROJECT_ID,
  projectSecret: process.env.IMESSAGE_PROJECT_SECRET,
});
```

The adapter also accepts a synchronous or asynchronous `credentials` provider. Use it when credentials come from a broker or secret manager and should be resolved only when the adapter first needs them.

```ts
const adapter = createiMessageAdapter({
  credentials: async () => {
    const value = await getSecret("photon/my-agent");
    return {
      projectId: value.projectId,
      projectSecret: value.projectSecret,
    };
  },
});
```

The provider must return `{ projectId, projectSecret }`.

## Self-hosted Advanced iMessage

Use a current gRPC endpoint rather than an HTTP or Socket.IO URL.

```ts
const adapter = createiMessageAdapter({
  serverUrl: process.env.IMESSAGE_SERVER_URL,
  apiKey: process.env.IMESSAGE_API_KEY,
});
```

`IMESSAGE_SERVER_URL` is a `host:port`, such as `imessage.example.com:443`. A URL scheme is not part of the transport address. For multi-number setups, pass explicit `{ address, token, phone }` clients instead.

## Webhook verification

Spectrum Cloud webhooks require either a per-webhook signing secret or a trusted-forwarder verifier.

```ts
const adapter = createiMessageAdapter({
  projectId: process.env.IMESSAGE_PROJECT_ID,
  projectSecret: process.env.IMESSAGE_PROJECT_SECRET,
  webhookSecret: process.env.IMESSAGE_WEBHOOK_SECRET,
});
```

`webhookVerifier` takes precedence over `webhookSecret`. It receives the request and exact raw body; return a truthy value to accept, a string to replace the verified body, or throw or return a falsy value to reject.

## Current options

| Option | Mode | Environment fallback | Notes |
|---|---|---|---|
| `projectId` | Spectrum Cloud | `IMESSAGE_PROJECT_ID` | Photon project ID. |
| `projectSecret` | Spectrum Cloud | `IMESSAGE_PROJECT_SECRET` | Photon project secret. Never log it. |
| `credentials` | Spectrum Cloud | — | Lazy sync or async `{ projectId, projectSecret }` provider. |
| `serverUrl` | Self-hosted | `IMESSAGE_SERVER_URL` | Current Advanced iMessage gRPC `host:port`. |
| `apiKey` | Self-hosted | `IMESSAGE_API_KEY` | Token for the self-hosted endpoint. |
| `clients` | Self-hosted | — | Explicit `{ address, token, phone }[]` clients. |
| `phone` | Self-hosted | `IMESSAGE_PHONE` | Optional routing identity for compatible setups. |
| `webhookSecret` | Cloud webhooks | `IMESSAGE_WEBHOOK_SECRET` | Per-webhook signing secret. |
| `webhookVerifier` | Cloud webhooks | — | Custom trusted-forwarder verification callback. |
| `logger` | Both | — | Adapter logger. |

## Removed local mode

The `local` option remains only for compatibility checking. `local: false` is accepted as a no-op; **`local: true` throws** because local on-device mode has been removed from the current adapter. Use the Spectrum local iMessage provider or `@photon-ai/imessage-kit` directly for macOS automation.

## Credential invariants

- Never commit or log a project secret, API key, client token, or webhook signing secret.
- Do not configure both cloud credentials and self-hosted clients and then depend on accidental precedence.
- Resolve secrets on the server. Do not bundle them into browser JavaScript.
- Rotate a live project secret only after updating every dependent deployment.

See the [current adapter repository](https://github.com/photon-hq/vercel-chat-adapter-imessage) for the shipped option types.
