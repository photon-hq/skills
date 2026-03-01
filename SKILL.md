---
name: imessage-kit-pro
description: >
  Comprehensive guide for building iMessage applications using @photon-ai/imessage-kit (Basic)
  and @photon-ai/advanced-imessage-kit (Advanced). Use when developing iMessage automation,
  AI agents, chat bots, or any macOS iMessage integration. Covers setup, API usage,
  best practices, and advanced features like tapbacks, effects, and group chat management.
license: MIT
metadata:
  author: photon-hq
  version: '1.1.0'
---

# iMessage Kit Pro

This skill provides comprehensive, self-contained knowledge for building iMessage applications and automations using both the Basic (`@photon-ai/imessage-kit`) and Advanced (`@photon-ai/advanced-imessage-kit`) libraries.

## When to Use

- User wants to build an iMessage bot, agent, or automation.
- User asks how to send or receive iMessage programmatically.
- User mentions `@photon-ai/imessage-kit` or `@photon-ai/advanced-imessage-kit`.
- User needs to manage iMessage group chats, send reactions (tapbacks), or use message effects.
- User is building a macOS application that integrates with iMessage.

## Kit Selection Guide

First, help the user choose the right tool for the job by asking about their requirements. Use the table below to guide the decision.

| Feature | Basic Kit (`@photon-ai/imessage-kit`) | Advanced Kit (`@photon-ai/advanced-imessage-kit`) |
| :--- | :--- | :--- |
| **Use Case** | Simple bots, personal automation, scheduled messages | Enterprise apps, multi-user systems, real-time agents |
| **Architecture** | Library, runs in your Node.js process | Client/Server, requires a separate server component |
| **Real-time** | Polling (periodic checks) | WebSockets (instant events) |
| **Message Sending** | Text, images, files | Text, images, files, **effects, replies, tapbacks** |
| **Message Control** | Send only | Send, **edit, unsend** |
| **Group Chats** | Send to existing groups | Send, **create, rename, add/remove participants** |
| **Advanced** | Scheduled messages, simple auto-reply | **Typing indicators, polls, Find My integration** |

**Recommendation:** For quick scripts or personal projects, start with the **Basic Kit**. For complex, real-time applications, use the **Advanced Kit**.

---

## Setup and Configuration

### Basic Kit Setup

**Installation (Bun):**
```bash
bun add @photon-ai/imessage-kit
```

**Installation (Node.js):**
```bash
npm install @photon-ai/imessage-kit better-sqlite3
```

**Initialization:**
```typescript
import { IMessageSDK } from "@photon-ai/imessage-kit";
const sdk = new IMessageSDK({ debug: true });
```

### Advanced Kit Setup

**Installation:**
```bash
npm install @photon-ai/advanced-imessage-kit
```

**Initialization & Connection:**
```typescript
import { SDK } from "@photon-ai/advanced-imessage-kit";

const sdk = SDK({
  serverUrl: "http://localhost:1234", // Your Advanced Kit server URL
  apiKey: "your-secret-api-key",
});

sdk.on('ready', () => console.log('Advanced Kit Ready!'));
await sdk.connect();
```

---

## Best Practices (Both Kits)

- **Graceful Shutdown:** Always close connections to release resources. `await sdk.close()` for both kits. For schedulers/reminders in the Basic Kit, call `destroy()`.
- **Prevent Reply Loops:** When making a bot, check if a message is from you before replying. The Basic Kit has `.ifFromOthers()`. In the Advanced Kit, check `if (message.isFromMe) return;`.
- **Use Absolute Paths:** Always use absolute file paths for attachments (e.g., `/Users/me/file.pdf`) to avoid errors.
- **Error Handling:** Wrap all SDK calls in `try...catch` blocks to handle potential network or file system failures gracefully.

---

## Basic Kit API Reference

### Sending Messages
Send text, images (local/remote URLs), or files. Combine them in one call.
```typescript
// Send text
await sdk.send("+15551234567", "Hello!");

// Send text, images, and files
await sdk.send("+15551234567", {
    text: "Here is the report.",
    files: ["/path/to/report.pdf"],
    images: ["https://example.com/chart.png"],
});
```

### Watching for Messages
Use polling to listen for new messages. The `message` chain is best for auto-replies.
```typescript
await sdk.startWatching({
    onDirectMessage: async (msg) => {
        await sdk.message(msg)
            .ifFromOthers() // Prevents infinite loops
            .matchText(/help/i)
            .replyText("How can I assist you?")
            .execute();
    },
});
```

### Scheduling Messages
- `MessageScheduler`: For cron-like jobs (`daily`, `hourly`, etc.).
- `Reminders`: For natural language scheduling (`in 10 minutes`, `tomorrow at 9am`).
```typescript
import { Reminders } from "@photon-ai/imessage-kit";
const reminders = new Reminders(sdk);
reminders.at("every Friday at 4pm", "+15551234567", "Submit your weekly report!");
// Always call reminders.destroy() on shutdown.
```

---

## Advanced Kit API Reference

### Sending Messages with Effects, Replies, and Reactions
```typescript
// Send with Fireworks effect
await sdk.messages.sendMessage({
    chatGuid: "iMessage;-;+15551234567",
    message: "Happy New Year!",
    effectId: "com.apple.messages.effect.CKFireworksEffect",
});

// Reply to a message
await sdk.messages.sendMessage({
    chatGuid: "iMessage;-;+15551234567",
    message: "This is a reply.",
    selectedMessageGuid: "p01/GUID-OF-ORIGINAL-MESSAGE",
});

// Send a 'love' reaction (tapback)
await sdk.messages.sendReaction({
    chatGuid: "iMessage;-;+15551234567",
    messageGuid: "p01/GUID-OF-MESSAGE-TO-REACT-TO",
    reaction: "love",
});
```

### Message Control (Edit & Unsend)
```typescript
// Edit a message
await sdk.messages.editMessage({
    chatGuid: "iMessage;-;+15551234567",
    messageGuid: "p01/GUID-OF-MESSAGE-TO-EDIT",
    editedMessage: "This is the corrected text.",
});

// Unsend a message
await sdk.messages.unsendMessage({
    chatGuid: "iMessage;-;+15551234567",
    messageGuid: "p01/GUID-OF-MESSAGE-TO-UNSEND",
});
```

### Group Chat Management
```typescript
// Add a participant to a group
await sdk.chats.addParticipant({
    chatGuid: "iMessage;+;chat_group_guid",
    participant: "+15557778888",
});

// Rename a group
await sdk.chats.renameChat({
    chatGuid: "iMessage;+;chat_group_guid",
    newName: "New Project Team Name",
});
```

### Typing Indicators
Show users the bot is working. Always wrap in `try...finally` to ensure the indicator is stopped.
```typescript
const chatGuid = "iMessage;-;+15551234567";
try {
    await sdk.chats.startTyping({ chatGuid });
    // ... your logic here ...
} finally {
    await sdk.chats.stopTyping({ chatGuid });
}
```
