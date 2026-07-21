# Local iMessage Kit 3.0

Read this reference only for `@photon-ai/imessage-kit` 3.0 on a Mac you control. Its object-based send/query/watch contract does not apply to Spectrum or either hosted SDK.

The package runs on macOS, reads the local Messages SQLite database, and sends through AppleScript. It requires Node.js 20 or later or Bun, a signed-in Messages.app account, and Full Disk Access for the process running the agent.

## Install and initialize

```bash
# Bun uses its built-in SQLite support.
bun add @photon-ai/imessage-kit

# Node needs the optional native driver.
npm install @photon-ai/imessage-kit better-sqlite3
```

Grant Full Disk Access under **System Settings → Privacy & Security → Full Disk Access**, then restart the terminal or IDE. This permission lets the process read `chat.db`.

Sending uses AppleScript. On the first send, allow the host terminal or IDE to control Messages.app. If you previously denied that prompt, enable Messages for the host under **System Settings → Privacy & Security → Automation**.

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

## Send

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

## Query messages and chats

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

## Watch messages

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

## Message and attachment fields

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

## Plugins

`onInit` and `onDestroy` take no arguments. Every other plugin hook receives one context object:

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

## Errors and scheduling

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

## Source

- [`@photon-ai/imessage-kit` 3.0.0 package manifest](https://unpkg.com/@photon-ai/imessage-kit@3.0.0/package.json)
- [Package repository](https://github.com/photon-hq/imessage-kit)
