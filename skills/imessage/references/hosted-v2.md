# Advanced iMessage 2.x

Read this reference only for the current `@photon-ai/advanced-imessage` 2.x package. Its HTTP/gRPC resources do not share constructors or raw effect handling with the legacy Advanced iMessage Kit package.

The package has two transports with different entrypoints. Resource methods share the same model, but live event streams are gRPC-only.

| Transport | Import | Runtime | Inbound events |
|---|---|---|---|
| HTTP | `createHttpClient` from the package root or `/http` | Any runtime with `fetch`, including Workers, Node, Bun, Deno, and browsers | Webhooks; no client-held live event streams |
| gRPC | `createClient` from `/grpc`, or `createGrpcClient` from the package root | Node or Bun | `subscribeEvents()`, `watch()`, and `events.catchUp()` |

Do not import `createClient` from the package root. That was the pre-2.0 gRPC entrypoint.

## HTTP client

```bash
bun add @photon-ai/advanced-imessage
```

```ts
import {
  createHttpClient,
  MessageEffect,
} from "@photon-ai/advanced-imessage";

const im = createHttpClient({
  address: "https://imessage.example.com",
  token: process.env.IMESSAGE_TOKEN!,
  retry: { maxAttempts: 3, initialDelay: 200, maxDelay: 5_000 },
});

try {
  const { chat } = await im.chats.create(["alice@example.com"]);
  const sent = await im.messages.sendText(chat.guid, "Happy birthday", {
    effect: MessageEffect.confetti,
  });
  console.log(sent.guid);
} finally {
  await im.close();
}
```

The HTTP `address` is the REST middleware, not a gRPC `host:port`. Bare addresses default to HTTPS. Set `server` only when Photon assigned a dedicated instance ID; it becomes the `x-photon-server` routing header.

The HTTP transport can run in fetch-only and edge runtimes. Inbound events arrive through signed webhooks; do not call gRPC-only stream methods on an HTTP client.

## gRPC client

```bash
bun add \
  @photon-ai/advanced-imessage \
  nice-grpc \
  nice-grpc-common \
  @grpc/grpc-js
```

```ts
import { createClient } from "@photon-ai/advanced-imessage/grpc";

const im = createClient({
  address: "imessage.example.com:443",
  token: process.env.IMESSAGE_TOKEN!,
});

try {
  const { chat } = await im.chats.create(["alice@example.com"]);

  for await (const event of im.messages.subscribeEvents({ chat: chat.guid })) {
    if (event.type !== "message.received") continue;
    if (event.message.isFromMe) continue;
    await im.messages.sendText(chat.guid, "Got it");
  }
} finally {
  await im.close();
}
```

Open live streams before running `im.events.catchUp(lastHandledSequence)` after startup or reconnect. Deduplicate by `sequence` and persist a checkpoint only after all earlier sequences have completed; do not wait for catch-up before opening live streams.

## Entrypoints

| Import | What it exposes |
|---|---|
| `@photon-ai/advanced-imessage` | `createHttpClient`, `createGrpcClient`, and shared types. Root option types are HTTP-flavored. |
| `@photon-ai/advanced-imessage/http` | HTTP transport only. |
| `@photon-ai/advanced-imessage/grpc` | gRPC transport, `createClient`, durable events, and live streams. |

Choose one transport for each sample. Do not construct an HTTP URL for gRPC or pass a gRPC `host:port` to the HTTP middleware by accident.

## Chats and messages

Message methods take a server `chat.guid`, not a bare recipient. Resolve one or more E.164 phone numbers or complete email addresses first:

```ts
const { chat } = await im.chats.create(["+15551234567"]);
const { chat: group } = await im.chats.create([
  "alice@example.com",
  "bob@example.com",
]);

await im.chats.markRead(chat.guid);
await im.chats.setTyping(chat.guid, true);
await im.chats.setTyping(chat.guid, false);

await im.groups.setDisplayName(group.guid, "Weekend");
await im.groups.addParticipants(group.guid, ["carol@example.com"]);
```

Send, reply, react, edit, and unsend with the messages resource:

```ts
const sent = await im.messages.sendText(chat.guid, "Hello");

await im.messages.sendText(chat.guid, "A threaded reply", {
  replyTo: sent.guid,
});

await im.messages.setReaction(
  chat.guid,
  sent.guid,
  { kind: "love" },
  true,
);

await im.messages.edit(chat.guid, sent.guid, "Corrected text");
await im.messages.unsend(chat.guid, sent.guid);
```

Classic reaction kinds are `love`, `like`, `dislike`, `laugh`, `emphasize`, and `question`. For a custom reaction use `{ kind: "emoji", emoji: "👍" }`. The final boolean to `setReaction` is `true` to add and `false` to remove.

Only edit or unsend messages sent by the authenticated line. Native iMessage time windows still apply.

## Effects and formatting

Use exported constants instead of copied raw effect IDs:

```ts
import {
  MessageEffect,
  TextEffect,
} from "@photon-ai/advanced-imessage";

await im.messages.sendText(chat.guid, "Bold then bloom", {
  effect: MessageEffect.lasers,
  formatting: [
    { type: "bold", start: 0, length: 4 },
    { type: "effect", start: 10, length: 5, effect: TextEffect.bloom },
  ],
});
```

`MessageEffect` includes `confetti`, `fireworks`, `balloons`, `heart`, `lasers`, `celebration`, `sparkles`, `spotlight`, `echo`, `slam`, `loud`, `gentle`, and `invisible`. Formatting ranges use UTF-16 code units, so emoji and other non-BMP characters can occupy two units.

## Attachments

Upload bytes first, then send the returned server attachment GUID. Hosted sends do not accept local file paths directly:

```ts
import { readFile } from "node:fs/promises";

const uploaded = await im.attachments.upload({
  fileName: "photo.jpg",
  data: await readFile("photo.jpg"),
});

await im.messages.sendAttachment(
  chat.guid,
  uploaded.attachment.guid,
);
```

For several text, mention, and attachment bubbles in one logical message, use `sendMultipart()` with uploaded attachment GUIDs.

Treat attachment names and bytes as untrusted data. Enforce size limits and never interpolate an inbound filename directly into a filesystem path.

## Polls, groups, addresses, and locations

The same client exposes focused resources for native iMessage features:

| Namespace | Examples |
|---|---|
| `im.polls` | Create polls, retrieve state, vote, unvote, and subscribe to poll events. |
| `im.groups` | Rename groups, add or remove participants, set icons, leave, and subscribe to group events. |
| `im.addresses` | Check reachability, address metadata, and Focus state. |
| `im.locations` | Request locations, read snapshots, and subscribe to live Find My updates. |

Use the operation-specific files under [`../advanced/`](../advanced/) for the complete current method signatures.

## Events and recovery

Live `subscribeEvents()` and `watch()` streams are gRPC-only. Streams are not automatically retried by the unary retry policy.

A durable consumer should:

1. Open the live stream.
2. Read the last persisted event sequence.
3. Call `im.events.catchUp(lastSequence)`.
4. Merge catch-up and live events by sequence.
5. Deduplicate.
6. Persist a checkpoint only after processing succeeds.
7. Reconnect with bounded backoff when the live stream fails.

Do not log full message bodies, tokens, attachment contents, or participant contact details while diagnosing an event stream.

## Errors and retries

Branch on error classes first and stable `error.code` second. Do not parse message text:

```ts
import {
  AuthenticationError,
  ConnectionError,
  IMessageError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "@photon-ai/advanced-imessage";

try {
  await im.messages.sendText(chat.guid, "Hello");
} catch (error) {
  if (error instanceof RateLimitError && error.retryable) {
    console.error("retry later", error.context);
  } else if (error instanceof NotFoundError) {
    console.error(error.code);
  } else if (error instanceof AuthenticationError) {
    console.error("refresh credentials");
  } else if (error instanceof ValidationError) {
    console.error("fix input", error.context);
  } else if (error instanceof ConnectionError) {
    console.error("network or timeout failure");
  } else if (error instanceof IMessageError) {
    console.error(error.code, error.context);
  } else {
    throw error;
  }
}
```

Client `retry` applies only to retryable unary calls; streams are not retried automatically. Use `clientMessageId` when a durable job may rerun the same logical write after a crash. Reuse the same ID only for retries of that one write and never share it across unrelated operations.

## HTTP inbound events

The HTTP client does not hold a live message stream. Register Spectrum Webhooks or Photon Webhook for the project, validate the delivery signature before parsing, then reply from the verified handler with `createHttpClient`.

Do not use the project secret as the webhook signing secret. Do not call gRPC event methods on the HTTP client.

## Source

- [`@photon-ai/advanced-imessage` package](https://www.npmjs.com/package/@photon-ai/advanced-imessage)
- [Advanced iMessage repository and current README](https://github.com/photon-hq/advanced-imessage-ts)
- [Official Advanced iMessage documentation](https://photon.codes/docs/advanced-kits/imessage/getting-started)
- [`../advanced/getting-started.md`](../advanced/getting-started.md) for the focused transport setup
