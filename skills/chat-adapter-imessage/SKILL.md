---
name: chat-adapter-imessage
description: >
  Connect Chat SDK bots to iMessage with `@photon-ai/chat-adapter-imessage`, the official Spectrum-backed adapter.
  Use for `createiMessageAdapter`, `new Chat({ adapters })`, Spectrum Cloud, self-hosted Advanced iMessage, signed
  webhooks, gateway listeners, DMs, files, tapbacks, edits, unsend, read state, typing, native polls, message effects,
  mini-app cards, voice messages, chat backgrounds, deployment, troubleshooting, and capability checks.
  Keywords: Chat SDK, Vercel Chat SDK, iMessage adapter, Photon, Spectrum, webhook, gateway listener, poll, tapback,
  message effect, projectId, projectSecret, mini app card, voice message, chat background.
license: MIT
metadata:
  author: photon-hq
  version: '2.1.0'
---

# Chat SDK: iMessage Adapter Skill

This skill is the complete reference for connecting a [Chat SDK](https://chat-sdk.dev/) bot to iMessage through Photon's official `@photon-ai/chat-adapter-imessage` package.

## Overview

The adapter translates Chat SDK threads, messages, reactions, modals, and file uploads into iMessage operations backed by Spectrum. It has two current modes:

- **Spectrum Cloud** — recommended for most applications; runs anywhere with a Photon project ID and project secret.
- **Self-hosted** — connects to a current `@photon-ai/advanced-imessage` gRPC endpoint.

> **Contract gate.** The current package is `@photon-ai/chat-adapter-imessage` 3.2.0. Local on-device mode has been removed: `local: true` throws. For local macOS automation, use Spectrum's separate `@spectrum-ts/imessage-local` provider or `@photon-ai/imessage-kit` directly.

Photon's generated Chat SDK page currently trails the published scoped package. When they disagree, follow the package manifest, exported types, tests, and repository README. Do not copy the old unscoped installation, single-adapter constructor, local-mode examples, HTTP/Socket.IO self-host transport, or old capability table.

## Setup and initialization

### Installation

```bash
pnpm add chat @photon-ai/chat-adapter-imessage
```

### Spectrum Cloud

```typescript
import { Chat } from "chat";
import { createiMessageAdapter } from "@photon-ai/chat-adapter-imessage";

export const bot = new Chat({
  userName: "mybot",
  adapters: {
    imessage: createiMessageAdapter({
      projectId: process.env.IMESSAGE_PROJECT_ID,
      projectSecret: process.env.IMESSAGE_PROJECT_SECRET,
    }),
  },
});

bot.onNewMention(async (thread) => {
  await thread.post("Hello from iMessage!");
});
```

Set the project credentials through the environment:

```bash
IMESSAGE_PROJECT_ID=...
IMESSAGE_PROJECT_SECRET=...
```

Never put the project secret in browser code, prompts, logs, or committed files.

### Lazy credentials

Use a credential provider when credentials come from a broker or tenant-specific secret store:

```typescript
createiMessageAdapter({
  credentials: async () => {
    const value = await getToken("photon/my-agent", {
      subject: { type: "app" },
    });

    return parsePhotonCredential(value);
  },
});
```

The provider must return `{ projectId, projectSecret }`.

### Self-hosted Advanced iMessage

Point the adapter at a current Advanced iMessage gRPC server:

```typescript
createiMessageAdapter({
  serverUrl: process.env.IMESSAGE_SERVER_URL,
  apiKey: process.env.IMESSAGE_API_KEY,
});
```

```bash
IMESSAGE_SERVER_URL=imessage.example.com:443
IMESSAGE_API_KEY=...
```

`IMESSAGE_SERVER_URL` is a gRPC `host:port`, not an `https://` or Socket.IO URL. For a multi-number self-hosted deployment, pass explicit clients:

```typescript
createiMessageAdapter({
  clients: [
    {
      address: "imessage.example.com:443",
      token: process.env.IMESSAGE_API_KEY!,
      phone: "+1234567890",
    },
  ],
});
```

## Configuration

`createiMessageAdapter(options)` detects cloud or self-hosted mode from explicit options and environment variables.

| Option | Required | Environment fallback | Description |
|---|---|---|---|
| `projectId` | Cloud | `IMESSAGE_PROJECT_ID` | Spectrum Cloud project ID. |
| `projectSecret` | Cloud | `IMESSAGE_PROJECT_SECRET` | Spectrum Cloud project secret. |
| `credentials` | Cloud | — | Sync or async provider returning `{ projectId, projectSecret }`. |
| `serverUrl` | Self-hosted | `IMESSAGE_SERVER_URL` | Current Advanced iMessage gRPC `host:port`. |
| `apiKey` | Self-hosted | `IMESSAGE_API_KEY` | Token for the self-hosted endpoint. |
| `clients` | No | — | Explicit `{ address, token, phone }[]` clients for multi-number self-hosting. |
| `phone` | No | `IMESSAGE_PHONE` | Optional self-hosted routing identity. |
| `webhookSecret` | Cloud webhook | `IMESSAGE_WEBHOOK_SECRET` | Per-webhook Spectrum signing secret. |
| `webhookVerifier` | No | — | Trusted-forwarder verifier receiving the request and exact raw body. Takes precedence over `webhookSecret`. |
| `logger` | No | — | Adapter logger; defaults to a console logger. |

`local: false` and `IMESSAGE_LOCAL=false` remain accepted as compatibility no-ops. `local: true`, or an `IMESSAGE_LOCAL` value other than `"false"`, throws.

## Receiving messages

There are two supported receiving paths. Pick one primary path per deployment and deduplicate if more than one can observe the same event.

| Environment | Preferred path |
|---|---|
| Serverless route | Signed Spectrum Cloud webhook |
| Long-running process | Gateway listener |
| Serverless fallback without webhooks | Scheduled overlapping gateway listener |
| Self-hosted worker | Gateway listener |

### Spectrum Cloud webhooks

Webhooks are the simplest serverless path: no persistent process and no cron job. Register a public HTTPS endpoint in Photon, store the one-time signing secret, and configure `IMESSAGE_WEBHOOK_SECRET`.

```typescript
// app/api/imessage/webhook/route.ts
import { after } from "next/server";
import { bot } from "@/lib/bot";

export async function POST(request: Request): Promise<Response> {
  return bot.webhooks.imessage(request, {
    waitUntil: (task) => after(() => task),
  });
}
```

`bot.webhooks.imessage` invokes the adapter's webhook handler, verifies the `X-Spectrum-Signature`, rejects stale or invalid deliveries, parses the message event, and routes it into the bot.

When a trusted gateway verifies Photon before forwarding, pass `webhookVerifier`. It receives the request and exact raw body. Return a falsy value or throw to reject, return a string to parse a verified replacement body, or return another truthy value to accept the original body.

Spectrum delivers at least once. Make downstream side effects idempotent with the delivery ID and message ID, acknowledge quickly, and move slow work through `waitUntil` or a queue.

A webhook delivery has no live event connection, but the adapter can rebuild the thread through Spectrum and respond:

```typescript
bot.onNewMention(async (thread) => {
  await thread.post("Got it!");
});
```

With multiple iMessage lines, an unseen conversation can be ambiguous because Spectrum cannot infer its serving line. In that case, respond from a thread observed by the gateway instead of cold-resolving it.

### Gateway listener

A long-running process can consume Spectrum's live message stream:

```typescript
await bot.adapters.imessage.startGatewayListener();
```

For a serverless listener, protect the route, keep it open for a bounded duration, and schedule the next invocation with overlap:

```typescript
// app/api/imessage/gateway/route.ts
import { after } from "next/server";
import { bot } from "@/lib/bot";

export const maxDuration = 800;

export async function GET(request: Request): Promise<Response> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return new Response("CRON_SECRET not configured", { status: 500 });
  }

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  return bot.adapters.imessage.startGatewayListener(
    { waitUntil: (task) => after(() => task) },
    600_000,
  );
}
```

Do not expose an unauthenticated gateway route. Avoid running duplicate receivers without event deduplication.

## Core Chat SDK behavior

Normal Chat SDK operations translate through the registered adapter:

```typescript
bot.onNewMention(async (thread, message) => {
  await message.addReaction("like");
  await thread.startTyping();

  try {
    await thread.post("Working on it.");
  } finally {
    await thread.stopTyping();
  }
});
```

The current adapter supports DMs, cold-start DMs through `openDM`, file uploads, reactions, editing, unsend, read state, typing, limited modals, and single-message lookup. It does not expose paginated message history or general thread information.

## Feature matrix

| Feature | Current support |
|---|---|
| Direct messages | Yes |
| Mentions | DMs only |
| Open DM | Yes, through `openDM` |
| File uploads | Yes, sending |
| Add reactions | Yes |
| Remove reactions | Yes, for reactions added during the current session |
| Message editing | Yes |
| Message delete / unsend | Yes, subject to the iMessage window and session resolution |
| Mark read | Yes, through `markRead` |
| Typing indicator | Yes |
| Message effects | Yes, through `sendEffect` |
| Mini-app cards | Yes, through `sendMiniApp` |
| Voice messages | Yes, through `sendVoice` |
| Chat backgrounds | Yes, through `setBackground` |
| Modals | Limited; one `Select` maps to an iMessage poll |
| Fetch one message | Yes, through `fetchMessage` |
| Message history | No; `fetchMessages` throws `NotImplementedError` |
| Thread or chat info | No; `fetchThread` throws `NotImplementedError` |
| Streaming | No |
| Ephemeral messages | No |
| Webhooks | Spectrum Cloud only |

## Modals as native polls

The adapter maps a Chat SDK modal's first `Select` to an iMessage poll:

```typescript
import { Chat, Modal, Select, SelectOption } from "chat";

bot.onNewMention(async (_thread, message) => {
  await message.openModal(
    Modal({
      callbackId: "fav-color",
      title: "What is your favorite color?",
      children: [
        Select({
          id: "color",
          label: "Pick a color",
          options: [
            SelectOption({ label: "Red", value: "red" }),
            SelectOption({ label: "Blue", value: "blue" }),
            SelectOption({ label: "Green", value: "green" }),
          ],
        }),
      ],
    }),
  );
});

bot.onModalSubmit("fav-color", async (event) => {
  console.log(event.values.color);
});
```

Only the first `Select` is used, with 2–10 options. Text inputs, radio selects, custom submit or close labels, multiple selects, and vote deselection are not supported. Poll titles in the same chat must be distinct because the adapter uses the title to match votes back to the modal.

## Tapback reactions

Chat SDK reaction names map to iMessage tapbacks:

| Chat SDK name | iMessage tapback |
|---|---|
| `love` / `heart` | Love |
| `like` / `thumbs_up` | Like |
| `dislike` / `thumbs_down` | Dislike |
| `laugh` | Laugh |
| `emphasize` / `exclamation` | Emphasize |
| `question` | Question |

Removing a reaction is session-scoped: the adapter can retract a tapback only when it observed the corresponding `addReaction` operation in the current process.

## Message effects

`sendEffect(threadId, message, effect)` exposes iMessage bubble and screen effects that have no first-class Chat SDK slot:

```typescript
import {
  createiMessageAdapter,
  iMessageEffect,
} from "@photon-ai/chat-adapter-imessage";

const adapter = createiMessageAdapter();

await adapter.sendEffect(thread.id, "Task complete!", "confetti");
await adapter.sendEffect(
  thread.id,
  "Task complete!",
  iMessageEffect.confetti,
);
```

Screen effects include `confetti`, `fireworks`, `balloons`, `heart`, `lasers`, `celebration`, `sparkles`, `spotlight`, and `echo`. Bubble effects include `slam`, `loud`, `gentle`, and `invisible`. Effects require non-empty text; an unknown effect throws `ValidationError`.

## Mini-app cards

`sendMiniApp(threadId, card)` sends a native iMessage mini-app balloon.

The lightweight form takes a URL, promise, or thunk:

```typescript
await adapter.sendMiniApp(thread.id, "https://example.com/menu");
await adapter.sendMiniApp(
  thread.id,
  async () => mintSignedLink(thread.id),
);
```

A full card identifies the iMessage extension and supplies layout metadata:

```typescript
await adapter.sendMiniApp(thread.id, {
  appName: "Poll Kit",
  teamId: "TEAM123",
  extensionBundleId: "com.example.pollkit.MessagesExtension",
  url: "https://example.com/poll/42",
  appStoreId: 1_234_567,
  layout: {
    caption: "Pizza night?",
    subcaption: "Tap to vote",
    imageTitle: "Friday",
    image: pngBytes,
    summary: "Vote on Friday's dinner",
  },
});
```

`appName`, `teamId`, `extensionBundleId`, and a valid URL are required for the full form. Layout fields are optional. Do not interpolate an untrusted extension identifier or destination URL without validation.

## Voice messages and chat backgrounds

`sendVoice` sends iMessage voice content through the adapter-specific extension surface. Validate MIME type, duration metadata, and file size before reading untrusted audio into memory.

`setBackground(threadId, input, options?)` sets or clears an iMessage chat background:

```typescript
import { readFile } from "node:fs/promises";

await adapter.setBackground(
  thread.id,
  await readFile("./wallpaper.jpg"),
  { mimeType: "image/jpeg" },
);

await adapter.setBackground(
  thread.id,
  "https://example.com/wallpaper.jpg",
);

await adapter.setBackground(thread.id, "clear");
```

The input can be the literal `"clear"`, image bytes, or an `http(s)` URL. Local path strings are rejected; read a local file into bytes. Image bytes need an inferable or explicit `image/*` MIME type.

## Formatting

Markdown-typed Chat SDK content is rendered through Spectrum's `markdown()` builder. Plain strings and raw content are sent as-is and are not reinterpreted as Markdown. Inbound iMessage content surfaces as plain text.

## Limitations

- **Multi-line cold resolution:** an unseen thread can be ambiguous when several iMessage lines are configured. Respond from a received thread when Spectrum cannot infer the serving line.
- **No paginated history:** `fetchMessages` is unsupported.
- **No thread-info fetch:** `fetchThread` is unsupported.
- **Session-scoped destructive actions:** `deleteMessage`, `removeReaction`, and some `markRead` paths require a target observed in the current session. Native iMessage time windows still apply.
- **No generic structured cards:** use `sendMiniApp` for native iMessage mini-app cards.
- **No streaming or ephemeral messages.**

Treat `NotImplementedError` as a capability boundary, not automatically as an authentication or transport failure.

## Breaking changes from the previous adapter

When upgrading from the old unscoped adapter:

- Replace `chat-adapter-imessage` with `@photon-ai/chat-adapter-imessage`.
- Replace the single-adapter Chat constructor with `new Chat({ userName, adapters: { imessage } })`.
- Remove local on-device mode. `local: true` and `IMESSAGE_LOCAL` values other than `"false"` now throw.
- Replace the old HTTP/Socket.IO self-host URL with a current gRPC `host:port`.
- Use `IMESSAGE_PROJECT_ID` and `IMESSAGE_PROJECT_SECRET` for Spectrum Cloud.
- Replace `adapter.sdk` with `adapter.app`; the Spectrum instance is `null` until initialization.
- Do not expect `fetchMessages` or `fetchThread`.

## Troubleshooting

### "serverUrl is required"

Provide either Spectrum Cloud credentials or a self-hosted `IMESSAGE_SERVER_URL` + `IMESSAGE_API_KEY`. Confirm environment variables are available to the process that launches the application.

### "Local (on-device) mode was removed"

Remove `local: true` and any `IMESSAGE_LOCAL` value other than `"false"`. Choose Spectrum Cloud, a self-hosted gRPC endpoint, Spectrum's local provider, or iMessage Kit as the actual package boundary.

### Self-host connection failures

- Confirm the server URL is `host:port`, not `https://...`.
- Verify the API key belongs to that endpoint.
- Confirm TLS and DNS from the deployment environment.
- Do not use credentials or URLs copied from the legacy HTTP/Socket.IO package.

### Webhook signature failures

- Pass the original `Request` or exact raw body.
- Use the per-webhook signing secret, not the Spectrum project secret.
- Check timestamp freshness and server clock skew.
- Do not parse and reserialize the JSON before verification.

### `NotImplementedError`

Check whether the call is `fetchMessages`, `fetchThread`, an ambiguous multi-line cold operation, or a session-scoped target that was never observed. Do not retry unsupported operations in a loop.

## References

1. [`@photon-ai/chat-adapter-imessage` on npm](https://www.npmjs.com/package/@photon-ai/chat-adapter-imessage)
2. [Adapter source and current README](https://github.com/photon-hq/vercel-chat-adapter-imessage)
3. [Photon Chat SDK documentation](https://photon.codes/docs/integrations/chat-sdk)
4. [Spectrum Webhooks](https://photon.codes/docs/webhooks/overview)
5. The `spectrum` skill in this repository for applications that do not already use Chat SDK
6. The `imessage` skill for local macOS or low-level hosted iMessage APIs
