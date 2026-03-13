---
name: chat-adapter-imessage
description: >
  Connect the Vercel AI SDK to iMessage. Build AI agents and assistants that communicate over iMessage using
  chat-adapter-imessage, the official Photon adapter. Local mode (runs on your Mac) and remote mode (Photon's
  production infrastructure). Covers createiMessageAdapter, postMessage, editMessage, deleteMessage, react,
  startGatewayListener, types, and integration with the Chat SDK.
  Keywords: vercel ai sdk, imessage, chat adapter, ai agent, chatbot, conversational ai, messaging, apple messages,
  vercel, nextjs, ai assistant, chat sdk, real-time, macos.
license: MIT
metadata:
  author: photon-hq
  version: '1.0.0'
---

# Vercel AI SDK: iMessage Adapter Skill

This skill provides a complete reference for using `chat-adapter-imessage`, the official Photon adapter for connecting the [Vercel AI SDK (Chat SDK)](https://sdk.vercel.ai) to iMessage.

## Overview

The adapter acts as a bridge, allowing you to build AI agents and assistants with the Vercel AI SDK that communicate with users over iMessage. It leverages `@photon-ai/imessage-kit` (self-hosted) and `@photon-ai/advanced-imessage-kit` (production infrastructure by Photon) under the hood.

### Key Features

- **Two Modes:** Run in **local mode** on any Mac for development, or **remote mode** connected to Photon's production iMessage infrastructure.
- **Unified Interface:** Provides a consistent API for sending and receiving messages, regardless of the underlying mode.
- **Vercel AI SDK Integration:** Implements the `Adapter` interface from the `chat` package, making it a drop-in solution.
- **Markdown Conversion:** Automatically converts markdown from the AI SDK into iMessage-compatible plain text.

---

## Setup and Initialization

### Installation

```bash
pnpm install chat-adapter-imessage @photon-ai/imessage-kit
# For remote mode, also install the advanced kit
pnpm install @photon-ai/advanced-imessage-kit
```

### `createiMessageAdapter(config)`

This is the main entry point. It creates and configures an instance of the `iMessageAdapter`.

```typescript
import { createiMessageAdapter } from 'chat-adapter-imessage';

// Local Mode: Runs on your Mac, uses your iMessage
const localAdapter = createiMessageAdapter({ local: true });

// Remote Mode: Connects to Photon's production servers
const remoteAdapter = createiMessageAdapter({
  local: false,
  serverUrl: process.env.IMESSAGE_SERVER_URL, // Provided by Photon
  apiKey: process.env.IMESSAGE_API_KEY      // Provided by Photon
});
```

#### Configuration (`iMessageAdapterConfig`)

| Mode | `local` | `serverUrl` | `apiKey` | Description |
| :--- | :--- | :--- | :--- | :--- |
| Local | `true` | Optional | Optional | Runs on macOS using `@photon-ai/imessage-kit`. `serverUrl` and `apiKey` are ignored. |
| Remote | `false` | **Required** | **Required** | Connects to Photon's infra using `@photon-ai/advanced-imessage-kit`. |

### Integrating with `Chat`

Once created, the adapter is passed to the `Chat` constructor from the Vercel AI SDK.

```typescript
import { Chat } from 'chat';
import { createiMessageAdapter } from 'chat-adapter-imessage';

const adapter = createiMessageAdapter({ local: true });

const chat = new Chat({
  adapter,
  // ... your other Chat config
});
```

---

## Core Adapter Methods

### `adapter.initialize(chat)`

Called by the `Chat` instance to link the adapter. In remote mode, this method also establishes the WebSocket connection to the Photon server.

### `adapter.postMessage(threadId, message)`

Sends a message to a specific iMessage thread.

- `threadId`: The encoded thread identifier, which is the `chatGuid` (e.g., `iMessage;-;+15551234567`).
- `message`: An `AdapterPostableMessage` object, which can be a simple string or a `FormattedContent` object with markdown.

```typescript
const threadId = 'iMessage;-;+15551234567'; // A direct message thread

// Send a simple text message
await adapter.postMessage(threadId, 'Hello from the adapter!');

// Send a message with markdown (will be converted to plain text)
await adapter.postMessage(threadId, {
  markdown: 'Here are the results:\n\n- **Item 1**\n- *Item 2*'
});
```

### `adapter.editMessage(threadId, messageId, message)`

Edits a previously sent message. **Only supported in remote mode.**

```typescript
await adapter.editMessage(
  'iMessage;-;+15551234567',
  'p:0/GUID-OF-MESSAGE-TO-EDIT',
  'This is the corrected text.'
);
```

### `adapter.deleteMessage(threadId, messageId)`

Unsends/deletes a previously sent message. **Only supported in remote mode.**

```typescript
await adapter.deleteMessage(
  'iMessage;-;+15551234567',
  'p:0/GUID-OF-MESSAGE-TO-DELETE'
);
```

### `adapter.react(threadId, messageId, emoji)`

Adds a tapback/reaction to a message. **Only supported in remote mode.**

- `emoji`: A standard emoji character or a name like `heart`, `like`, `laugh`.

```typescript
await adapter.react(
  'iMessage;-;+15551234567',
  'p:0/GUID-OF-MESSAGE-TO-REACT-TO',
  '❤️'
);
```

### `adapter.startGatewayListener(options)`

This is the primary method for receiving messages. It starts a listener that ingests messages from both local and remote SDKs and forwards them to the `Chat` instance.

```typescript
// In your main application file

const adapter = createiMessageAdapter({ local: true });
const chat = new Chat({ adapter });

// Start listening for incoming iMessages
adapter.startGatewayListener();

// Now, messages sent to your iMessage will be processed by the Chat SDK
chat.on('message', (message) => {
  console.log(`[${message.author.userName}]: ${message.text}`);
  // Your AI logic here...
});
```

### `adapter.handleWebhook(request)`

**This method is not supported.** The adapter does not use traditional webhooks for message ingestion. You must use `startGatewayListener()` instead.

---

## Type Reference

### `iMessageThreadId`

The decoded `threadId` object.

```typescript
interface iMessageThreadId {
  chatGuid: string; // e.g., "iMessage;-;+1234567890"
}
```

### `iMessageGatewayMessageData`

The normalized message object that the adapter uses internally.

```typescript
interface iMessageGatewayMessageData {
  guid: string;
  text: string | null;
  sender: string;
  senderName: string | null;
  chatId: string;
  isGroupChat: boolean;
  isFromMe: boolean;
  date: string; // ISO 8601
  attachments: iMessageAttachment[];
  source: 'local' | 'remote';
  raw?: unknown; // Original message object from the underlying SDK
}
```

### `NativeWebhookPayload`

If using the Self-Hosted Kit's native webhook feature, this is the shape of the JSON payload that will be sent to your endpoint. The adapter can process this payload.

```typescript
interface NativeWebhookPayload {
  guid: string;
  text: string | null;
  sender: string;
  chatId: string;
  // ... and other fields from the Basic Kit Message object
}
```

---

## References

1.  [Vercel AI SDK (Chat)](https://sdk.vercel.ai/docs/chat)
2.  [chat-adapter-imessage on npm](https://www.npmjs.com/package/chat-adapter-imessage)
3.  [Photon](https://photon.codes/spectrum)
