# Advanced iMessage 2.0

Read this reference only for `@photon-ai/advanced-imessage` 2.0. Its current HTTP/gRPC resources do not share constructors or raw effect handling with the legacy `@photon-ai/advanced-imessage-kit` package.

Version 2 has two transports with different entrypoints. Resource methods share the same model, but live event streams are gRPC-only.

| Transport | Import | Runtime | Inbound events |
|---|---|---|---|
| HTTP | `createHttpClient` from the package root or `/http` | Any runtime with `fetch`, including Workers, Node, Bun, Deno, and browsers | Webhooks; no client-held live event streams |
| gRPC | `createClient` from `/grpc`, or `createGrpcClient` from the package root | Node or Bun | `subscribeEvents()`, `watch()`, and `events.catchUp()` |

Do not import `createClient` from the package root in 2.0; that was the pre-2.0 gRPC entrypoint.

## HTTP client

```bash
bun add @photon-ai/advanced-imessage
```

```ts
import { createHttpClient, MessageEffect } from "@photon-ai/advanced-imessage";

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

The HTTP `address` is the HTTP middleware, not a gRPC `host:port`. Bare addresses default to HTTPS. Set `server` only when Photon assigned a dedicated instance ID; it becomes the `x-photon-server` routing header.

## gRPC client

```bash
bun add @photon-ai/advanced-imessage nice-grpc nice-grpc-common @grpc/grpc-js
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

## Effects

Use exported constants, not copied raw effect IDs:

```ts
import { MessageEffect, TextEffect } from "@photon-ai/advanced-imessage";

await im.messages.sendText(chat.guid, "Bold then bloom", {
  effect: MessageEffect.lasers,
  formatting: [
    { type: "bold", start: 0, length: 4 },
    { type: "effect", start: 10, length: 5, effect: TextEffect.bloom },
  ],
});
```

`MessageEffect` includes `confetti`, `fireworks`, `balloons`, `heart`, `lasers`, `celebration`, `sparkles`, `spotlight`, `echo`, `slam`, `loud`, `gentle`, and `invisible`. Formatting ranges use UTF-16 code units.

## Attachments

Upload raw bytes, then send the returned server attachment GUID. Hosted message sends do not accept local file paths:

```ts
import { readFile } from "node:fs/promises";

const uploaded = await im.attachments.upload({
  fileName: "photo.jpg",
  data: await readFile("photo.jpg"),
});

await im.messages.sendAttachment(chat.guid, uploaded.attachment.guid);
```

For multiple text, mention, and attachment bubbles in one logical message, use `sendMultipart()` with uploaded attachment GUIDs.

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

Client `retry` applies only to retryable unary calls; streams are not retried automatically. Use `clientMessageId` when a durable job may rerun the same logical write after a crash. Reuse the same ID for retries of that one write and never share it across unrelated operations.

## HTTP inbound events

The HTTP client is outbound-only. Register Photon Webhook for the project, validate its HMAC signature according to the webhook documentation, then reply from the handler with `createHttpClient`. Do not call gRPC stream methods on the HTTP client.

## Source

- [`@photon-ai/advanced-imessage` 2.0.2 package manifest](https://unpkg.com/@photon-ai/advanced-imessage@2.0.2/package.json)
- [Official Advanced iMessage docs](https://photon.codes/docs/advanced-kits/imessage/getting-started)
