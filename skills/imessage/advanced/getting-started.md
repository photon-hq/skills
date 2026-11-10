# Advanced iMessage getting started

Most new agent applications should start with Spectrum. Use `@photon-ai/advanced-imessage` directly only when the requested iMessage capability is not exposed by Spectrum.

The package supports two transports with different entrypoints and runtime constraints:

| Transport | Import | Runtime | Inbound events |
|---|---|---|---|
| HTTP | `createHttpClient` from the package root or `/http` | Any runtime with `fetch`, including Workers, Node, Bun, Deno, and browsers | Webhooks; no client-held live streams |
| gRPC | `createClient` from `/grpc`, or `createGrpcClient` from the package root | Node.js or Bun | `subscribeEvents()`, `watch()`, and `events.catchUp()` |

Do not import `createClient` from the package root. That was the pre-2.0 gRPC entrypoint.

## HTTP quickstart

Use HTTP for outbound calls in edge, browser, or fetch-only runtimes:

```bash
npm install @photon-ai/advanced-imessage
```

```ts
import { createHttpClient } from "@photon-ai/advanced-imessage";

const im = createHttpClient({
  address: process.env.IMESSAGE_HTTP_ADDRESS!,
  token: process.env.IMESSAGE_TOKEN!,
});

try {
  const { chat } = await im.chats.create(["+15551234567"]);
  const message = await im.messages.sendText(chat.guid, "Hello from Photon");
  console.log(message.guid);
} finally {
  await im.close();
}
```

The HTTP address is the REST middleware. It can be a full `http(s)://` URL or a bare host that defaults to HTTPS. HTTP clients receive inbound messages through signed webhooks rather than client-held streams.

## gRPC quickstart

Use gRPC for live event streams and the full streaming surface:

```bash
npm install \
  @photon-ai/advanced-imessage \
  nice-grpc \
  nice-grpc-common \
  @grpc/grpc-js
```

```ts
import { createClient } from "@photon-ai/advanced-imessage/grpc";

const im = createClient({
  address: process.env.IMESSAGE_GRPC_ADDRESS!,
  token: process.env.IMESSAGE_TOKEN!,
});

try {
  const { chat } = await im.chats.create(["+15551234567"]);
  const message = await im.messages.sendText(chat.guid, "Hello from Photon");
  console.log(message.guid);

  for await (const event of im.messages.subscribeEvents({ chat: chat.guid })) {
    console.log(event.type, event.sequence);
  }
} finally {
  await im.close();
}
```

The gRPC address is a `host:port` without `https://`. Node.js 18.17 or later and Bun are supported; fetch-only runtimes cannot load the native gRPC peers.

## Entrypoints

| Import | What it exposes |
|---|---|
| `@photon-ai/advanced-imessage` | `createHttpClient`, `createGrpcClient`, and shared types. Root option types default to the HTTP flavor. |
| `@photon-ai/advanced-imessage/http` | HTTP transport only. |
| `@photon-ai/advanced-imessage/grpc` | gRPC transport, including `createClient`, events, and live streams. |

Choose one transport in each sample. Resource methods share the same high-level namespaces, but transport options and event availability differ.

## Requirements and credentials

- Use a complete email address or E.164 phone number when creating a conversation.
- Store the bearer token in a secret manager or environment variable.
- Keep TLS enabled for hosted endpoints.
- Close clients during shutdown.
- Use a webhook for HTTP inbound delivery and gRPC streams for client-held events.
- Do not combine the current SDK with legacy Advanced iMessage Kit methods.

## Client options

The exact option type depends on the transport. Common fields include:

| Option | Required | Meaning |
|---|---:|---|
| `address` | Yes | HTTP middleware URL/host for HTTP, or gRPC `host:port` for gRPC. |
| `token` | Yes | Bearer token or the transport's supported async token provider. Never log it. |
| `tls` | No | Keep enabled for hosted endpoints; disable only for local development where supported. |
| `timeout` | No | Default timeout for unary operations. Streams remain open independently. |
| `retry` | No | Retry policy for retryable unary calls. Live streams are not retried automatically. |
| `server` | HTTP only | Dedicated Photon instance ID used for routing; not the middleware address or token. |

## Resource map

| Namespace | Responsibility |
|---|---|
| `im.messages` | Sends, replies, reactions, stickers, edits, unsend, queries, and message events. |
| `im.chats` | Chat creation, state, read state, typing, contact cards, backgrounds, and chat events. |
| `im.groups` | Group names, participants, icons, leaving, and group events. |
| `im.attachments` | Uploads, metadata, and streamed downloads. |
| `im.polls` | Poll creation, state, votes, options, and poll events. |
| `im.addresses` | Availability, address metadata, and Focus state. |
| `im.locations` | Location requests, snapshots, and live Find My updates. |
| `im.events` | Durable catch-up after disconnects; gRPC only. |

Message, chat, group, attachment, poll, and location APIs use server identifiers returned by the SDK. Do not pass a bare phone number where a `chat.guid`, message GUID, or attachment GUID is required.

## See also

- [Advanced iMessage repository and README](https://github.com/photon-hq/advanced-imessage-ts)
- [Advanced iMessage documentation](https://photon.codes/docs/advanced-kits/imessage/getting-started)
- [`messages.md`](./messages.md) for sends, queries, mutations, and message events
- [`events.md`](./events.md) for live streams, catch-up, and reconnect handling
- [`../references/hosted-v2.md`](../references/hosted-v2.md) for the retained comprehensive compatibility reference
