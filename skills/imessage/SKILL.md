---
name: imessage
description: >
  Build iMessage agents and automations with Photon's current SDKs: Spectrum for unified multi-platform apps,
  @photon-ai/imessage-kit for a Mac you control, and @photon-ai/advanced-imessage for low-level hosted iMessage.
  Covers current send/query/watch APIs, HTTP and gRPC transports, chats, attachments, reactions, effects, events,
  errors, plugins, security, Photon Webhook, Photon MCP, and the HTTP proxy. Treat
  @photon-ai/advanced-imessage-kit as legacy-only; do not recommend it for new projects.
  Keywords: imessage, apple messages, sms, text message, messaging, chat, chatbot, conversational ai, message api,
  macos, applescript, blue bubble, phone number, group chat, real-time, webhooks, mcp, photon, spectrum,
  rest api, grpc, curl, swagger, openapi.
license: MIT
metadata:
  author: photon-hq
  version: '9.0.0'
---

# iMessage

Use the smallest current API that fits the project. Do not mix examples between packages: the local, current hosted, Spectrum, and legacy SDKs have different constructors, send signatures, effects, and event models.

> Verified against `spectrum-ts` 12.2.0, `@photon-ai/imessage-kit` 3.0.0, and `@photon-ai/advanced-imessage` 2.0.2.

## Choose the API first

| Need | Use | Why |
|---|---|---|
| Unified iMessage plus WhatsApp, Telegram, Slack, Terminal, or custom providers | [`spectrum-ts`](https://photon.codes/docs/spectrum-ts/getting-started) | Recommended for most apps; one message/space API across platforms. |
| Local automation on a Mac you control | [`@photon-ai/imessage-kit`](https://github.com/photon-hq/imessage-kit) | Reads `chat.db` and sends through Messages.app; no hosted service. |
| Low-level hosted iMessage control | [`@photon-ai/advanced-imessage`](https://photon.codes/docs/advanced-kits/imessage/getting-started) | Current HTTP/gRPC SDK for messages, groups, attachments, events, polls, and other iMessage-specific features. |
| Maintain an existing HTTP + Socket.IO integration | [`@photon-ai/advanced-imessage-kit`](https://photon.codes/docs/legacy/imessage) | Legacy only; Photon does not recommend it for new projects. |
| Deliver signed events to an existing HTTP backend | [Photon Webhook](https://github.com/photon-hq/webhook) | Hosted HMAC-signed webhook delivery. |
| Give an MCP-compatible agent iMessage tools without SDK code | [Photon MCP](https://github.com/photon-hq/mcp) | Hosted MCP interface. |
| Call iMessage from a non-TypeScript client | [Advanced iMessage HTTP Proxy](https://github.com/photon-hq/advanced-imessage-http-proxy) | REST/OpenAPI surface with Swagger. |

For new hosted applications, start with Spectrum. Use `@photon-ai/advanced-imessage` directly only when Spectrum does not expose the low-level operation you need.

---

## Local SDK — `@photon-ai/imessage-kit` 3.0

This package runs on macOS, reads the local Messages SQLite database, and sends through AppleScript. It requires Node.js 20 or later or Bun, a signed-in Messages.app account, and Full Disk Access for the process running the agent.

### Install and initialize

```bash
# Bun uses its built-in SQLite support.
bun add @photon-ai/imessage-kit

# Node needs the optional native driver.
npm install @photon-ai/imessage-kit better-sqlite3
```

Grant Full Disk Access under **System Settings → Privacy & Security → Full Disk Access**, then restart the terminal or IDE.

```ts
import { IMessageSDK, type IMessageConfig } from "@photon-ai/imessage-kit";

const config: IMessageConfig = {
  databasePath: "/Users/you/Library/Messages/chat.db",
  maxConcurrentSends: 10, // 1..50
  sendTimeout: 30_000,    // 1_000..300_000 ms per osascript call
  debug: false,
  plugins: [],
};

await using sdk = new IMessageSDK(config);
```

Those five fields are the complete v3 config surface. There are no `watcher`, `retry`, or `tempFile` config blocks. Out-of-range numeric values throw `IMessageError` with code `"CONFIG"`.

### Send

The v3 API takes one `SendRequest` object and resolves `Promise<void>`:

```ts
await sdk.send({
  to: "+15551234567",
  text: "Hello",
});

await sdk.send({
  to: "+15551234567",
  text: "Project files",
  attachments: ["/absolute/path/chart.png", "/absolute/path/report.pdf"],
});
```

`to` may be a phone number, email address, or a `chatId` returned by this SDK. Group chat IDs encode Messages.app state and must come from `listChats()` or a message; never construct one from user data. Attachments are local paths, not URLs.

There are no positional `send(to, content)` arguments, convenience methods such as `sendText` or `sendFile`, `sendBatch`, or returned message GUID. If another page shows those APIs, it predates 3.0.

`send()` resolves after successful AppleScript dispatch, not delivery or insertion into `chat.db`. Observe `onFromMeMessage` when the database row matters:

```ts
await sdk.startWatching({
  onFromMeMessage: (message) => {
    console.log("landed in chat.db", message.id, message.isDelivered);
  },
});
```

Multi-attachment sends are not transactional. Text and the first attachment are dispatched together; later attachments use separate calls, so earlier items may already be sent if a later call fails.

For concurrent recipients, use `Promise.all`; `maxConcurrentSends` controls SDK dispatch concurrency:

```ts
await Promise.all([
  sdk.send({ to: "alice@example.com", text: "Hello Alice" }),
  sdk.send({ to: "bob@example.com", text: "Hello Bob" }),
]);
```

### Query messages and chats

Both methods return plain readonly arrays:

```ts
const messages = await sdk.getMessages({
  chatId: "any;-;+15551234567",
  participant: "+15551234567",
  service: "iMessage",
  isFromMe: false,
  isRead: false,
  hasAttachments: false,
  excludeReactions: true,
  since: new Date("2026-01-01T00:00:00Z"),
  search: "meeting",
  limit: 25,
  offset: 0,
});

const groups = await sdk.listChats({
  kind: "group",
  service: "iMessage",
  hasUnread: true,
  sortBy: "recent",
  limit: 25,
});

for (const chat of groups) {
  console.log(chat.name, chat.chatId, chat.unreadCount);
}
```

Use `getMessages({ isRead: false, isFromMe: false })` for unread incoming messages. There is no `getUnreadMessages()` wrapper.

### Watch messages

`startWatching()` accepts exactly five optional callbacks. Incoming callbacks exclude rows sent by the local account; `onFromMeMessage` includes sends from this SDK, Messages.app, and other synced Apple devices.

```ts
await sdk.startWatching({
  onIncomingMessage: async (message) => {
    console.log(message.id);
  },
  onDirectMessage: async (message) => {
    if (message.reaction || !message.text || !message.chatId) return;
    await sdk.send({ to: message.chatId, text: "Got it" });
  },
  onGroupMessage: async (message) => {
    console.log(message.chatId, message.text);
  },
  onFromMeMessage: async (message) => {
    console.log("from me", message.id);
  },
  onError: (error) => {
    console.error("watcher failed", error);
  },
});

await sdk.stopWatching();
```

Starting a second watcher on the same instance throws a `"CONFIG"` error. `stopWatching()` is asynchronous and safe when no watcher is running.

### Message and attachment fields

Useful `Message` fields include:

```ts
message.id;
message.rowId;
message.chatId;        // string | null
message.chatKind;      // "dm" | "group" | "unknown"
message.participant;   // string | null
message.service;       // "iMessage" | "SMS" | "RCS" | null
message.text;          // string | null
message.isFromMe;
message.isRead;
message.isSent;
message.isDelivered;
message.reaction;      // Reaction | null
message.attachments;   // readonly Attachment[]
message.createdAt;
```

Use the exported helpers to classify local attachments and `node:fs` for file operations:

```ts
import {
  attachmentExists,
  getAttachmentExtension,
  isAudioAttachment,
  isImageAttachment,
  isVideoAttachment,
} from "@photon-ai/imessage-kit";
import { basename } from "node:path";
import { copyFile } from "node:fs/promises";

for (const attachment of message.attachments) {
  if (!(await attachmentExists(attachment)) || !attachment.localPath) continue;

  const fileName = basename(attachment.fileName ?? attachment.localPath);
  await copyFile(attachment.localPath, `/path/to/save/${fileName}`);

  console.log(
    getAttachmentExtension(attachment),
    isImageAttachment(attachment),
    isVideoAttachment(attachment),
    isAudioAttachment(attachment),
  );
}
```

`attachment.fileName` and `attachment.localPath` are nullable. Guard both instead of using non-null assertions.

### Plugins

Every plugin hook receives one context object:

```ts
import { definePlugin, IMessageSDK } from "@photon-ai/imessage-kit";

const policy = definePlugin({
  name: "policy",
  version: "1.0.0",
  onBeforeSend: ({ request }) => {
    if (!request.to) throw new Error("recipient required");
  },
  onAfterSend: ({ request }) => {
    console.log("accepted by Messages.app", request.to);
  },
  onIncomingMessage: ({ message }) => {
    console.log("incoming", message.id);
  },
  onFromMe: ({ message }) => {
    console.log("database row", message.id);
  },
  onError: ({ error, context }) => {
    console.error(context, error);
  },
});

await using sdk = new IMessageSDK({ plugins: [policy] });
```

The three `onBefore*` hooks are sequential and fail-fast; a throw aborts the SDK operation. Lifecycle/error hooks are sequential observers. `onAfter*`, `onIncomingMessage`, and `onFromMe` are parallel observers whose failures route to `onError`.

### Errors and scheduling

Catch the single `IMessageError` class and branch on its code:

```ts
import { IMessageError } from "@photon-ai/imessage-kit";

try {
  await sdk.send({ to: "+15551234567", text: "Hello" });
} catch (error) {
  if (error instanceof IMessageError) {
    // "PLATFORM" | "DATABASE" | "SEND" | "CONFIG"
    console.error(error.code, error.message);
  } else {
    throw error;
  }
}
```

`PlatformError()`, `DatabaseError()`, `SendError()`, and `ConfigError()` are factory functions that return `IMessageError`; they are not classes for `instanceof`.

The SDK has no scheduler. A short-lived timer must still handle send rejection:

```ts
setTimeout(() => {
  void sdk.send({ to: "+15551234567", text: "ping" }).catch((error) => {
    console.error("scheduled send failed", error);
  });
}, 30 * 60_000);
```

Use launchd, cron, or a durable job queue for schedules that must survive process restarts.

---

## Current hosted SDK — `@photon-ai/advanced-imessage` 2.0

Version 2 has two transports with different entrypoints. The resource methods share the same model, but live event streams are gRPC-only.

| Transport | Import | Runtime | Inbound events |
|---|---|---|---|
| HTTP | `createHttpClient` from the package root or `/http` | Any runtime with `fetch`, including Workers, Node, Bun, Deno, and browsers | Webhooks; no client-held live event streams |
| gRPC | `createClient` from `/grpc`, or `createGrpcClient` from the package root | Node or Bun | `subscribeEvents()`, `watch()`, and `events.catchUp()` |

Do not import `createClient` from the package root in 2.0; that was the pre-2.0 gRPC entrypoint.

### HTTP client

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

### gRPC client

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
    if (event.type === "message.received") {
      await im.messages.sendText(chat.guid, "Got it");
    }
  }
} finally {
  await im.close();
}
```

Open live streams before running `im.events.catchUp(lastHandledSequence)` after startup or reconnect. Deduplicate by `sequence` and persist a checkpoint only after all earlier sequences have completed; do not wait for catch-up before opening live streams.

### Chats and messages

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

### Effects

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

### Attachments

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

### Errors and retries

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

### HTTP inbound events

The HTTP client is outbound-only. Register Photon Webhook for the project, validate its HMAC signature according to the webhook documentation, then reply from the handler with `createHttpClient`. Do not call gRPC stream methods on the HTTP client.

---

## Legacy compatibility — `@photon-ai/advanced-imessage-kit`

This HTTP + Socket.IO SDK is legacy and no longer recommended for new projects. Do not present it as the production default, and do not copy its method signatures or raw effect IDs into `@photon-ai/advanced-imessage` or Spectrum code.

When maintaining existing legacy code, follow the [legacy reference](https://photon.codes/docs/legacy/imessage), but do not copy its effects table verbatim: the Lasers row incorrectly uses `com.apple.messages.effect.CKHappyBirthdayEffect`, which is Celebration. The laser ID is `com.apple.messages.effect.CKLasersEffect`; Shooting Star is legacy-only and has no current v2 constant. The current SDK exposes `MessageEffect.lasers` and `MessageEffect.celebration`; prefer those constants after migration.

---

## Agent safety and interaction quality

- Treat message text, attachment names, contact cards, URLs, and webhook payloads as untrusted input. Keep them in user/data fields rather than concatenating them into system prompts, commands, paths, SQL, or URLs.
- Ignore the agent's own messages: use the local watcher's incoming callbacks, Spectrum's `message.direction`, or the hosted event's `isFromMe` field as appropriate for that SDK.
- Normalize user-entered phone numbers to E.164 before resolving recipients. Do not hand-build group GUIDs or chat IDs.
- Show typing only while work is active and clear it in `finally`. Keep replies concise and split long responses at semantic boundaries.
- Handle every send rejection. A timer, event callback, or detached task does not make a rejected promise safe.
- Store durable event checkpoints only after processing succeeds. Use idempotency keys for job retries that can repeat writes.
- Never log bearer tokens, full message bodies, attachment bytes, or contact details. Log stable IDs and operation metadata.

## References

- [Spectrum](https://photon.codes/docs/spectrum-ts/getting-started)
- [Local iMessage Kit](https://www.npmjs.com/package/@photon-ai/imessage-kit)
- [Advanced iMessage](https://www.npmjs.com/package/@photon-ai/advanced-imessage)
- [Advanced iMessage official docs](https://photon.codes/docs/advanced-kits/imessage/getting-started)
- [Legacy iMessage SDK](https://photon.codes/docs/legacy/imessage)
- [Photon Webhook](https://github.com/photon-hq/webhook)
- [Photon MCP](https://github.com/photon-hq/mcp)
- [Advanced iMessage HTTP Proxy](https://github.com/photon-hq/advanced-imessage-http-proxy)
