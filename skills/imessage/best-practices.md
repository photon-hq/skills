---
title: iMessage Kit Best Practices
impact: MEDIUM
impactDescription: Guidelines for building robust, secure, and efficient iMessage applications.
tags: [best-practices, security, performance, error-handling]
---

# iMessage Kit Best Practices

These guidelines apply to both the Basic and Advanced iMessage Kits and are crucial for building reliable, secure, and efficient applications.

## 1. Graceful Shutdown

Always ensure you properly close connections and destroy timers to prevent resource leaks and allow your application to shut down cleanly. Use `try...finally` to guarantee cleanup runs even when errors occur.

**Basic Kit:**

```typescript
const sdk = new IMessageSDK();
try {
  await sdk.send('+1234567890', 'Hello!');
} finally {
  await sdk.close();
}
```

**Advanced Kit:**

```typescript
const sdk = SDK({ serverUrl, apiKey });
try {
  await sdk.connect();
  // ... operations ...
} finally {
  await sdk.close();
}
```

**Schedulers (Basic Kit):**

```typescript
const scheduler = new MessageScheduler(sdk);
try {
  scheduler.schedule({ to: '+1234567890', content: 'Reminder!', sendAt: new Date(Date.now() + 60000) });
  // ... keep running ...
} finally {
  scheduler.destroy();
  await sdk.close();
}
```

## 2. Prevent Auto-Reply Loops

When building an auto-reply bot, it is **critical** to prevent it from replying to its own messages, which would create an infinite loop and could lead to your Apple ID being blocked.

-   **Basic Kit (Recommended):** The `message` chain API has a built-in safeguard. Always start your chain with `.ifFromOthers()`.

    ```typescript
    await sdk.message(msg)
      .ifFromOthers() // This method prevents replying to self
      .matchText(/hello/i)
      .replyText("Hi there!")
      .execute();
    ```

-   **Advanced Kit (Manual Check):** You must manually check the `isFromMe` boolean property on the incoming message object before processing it.

    ```typescript
    sdk.on("new-message", async (message) => {
        if (message.isFromMe) {
            return; // Do not process messages sent by the bot
        }
        // Your reply logic here
    });
    ```

## 3. Use Absolute Paths for Attachments

When sending file attachments with either kit, always use absolute file paths (e.g., `/Users/me/Documents/report.pdf`). Relative paths (e.g., `./report.pdf`) can be ambiguous and may fail depending on the working directory from which your script is executed.

## 4. Robust Error Handling

Network requests, file system operations, and AppleScript executions can fail for many reasons. To build a resilient application, always wrap SDK calls in `try...catch` blocks to handle potential errors gracefully.

```typescript
try {
  await sdk.send("+1234567890", "Hello!");
} catch (error) {
  console.error("Failed to send message:", error);
  // Implement retry logic or user notification if necessary
}
```

## 5. Use Typing Indicators (Advanced Kit)

For a better user experience, use typing indicators to show that your bot is processing a request. Always wrap the logic in a `try...finally` block to ensure the indicator is stopped, even if an error occurs.

```typescript
const chatGuid = "iMessage;-;+1234567890";
try {
    await sdk.chats.startTyping(chatGuid);
    // ... your logic that might take time ...
    await sdk.messages.sendMessage({ chatGuid, message: "Here is the result." });
} finally {
    await sdk.chats.stopTyping(chatGuid);
}
```

## 6. Message Deduplication (Advanced Kit)

Long-running agents accumulate processed message GUIDs in memory. Periodically clear the cache to prevent memory leaks while retaining a safety window for deduplication:

```typescript
setInterval(() => {
  const count = sdk.getProcessedMessageCount();
  if (count > 5000) {
    sdk.clearProcessedMessages(1000);
  }
}, 60000);
```

## 7. Handle Disconnects with Bounded Retry (Advanced Kit)

Avoid tight reconnect loops that hammer the server. Use a bounded retry with backoff:

```typescript
sdk.on('disconnect', () => {
  console.warn('Disconnected. Reconnecting in 5s...');
  setTimeout(() => sdk.connect(), 5000);
});
```

---

## Common Patterns

### Pattern: Message History Analysis

```typescript
const messages = await sdk.getMessages({
  sender: '+1234567890',
  limit: 100,
  since: new Date('2025-01-01')
});

for (const msg of messages.messages) {
  console.log(`[${msg.date.toISOString()}] ${msg.sender}: ${msg.text}`);
}
```

### Pattern: Unread Message Processor

```typescript
const unread = await sdk.getUnreadMessages();

for (const { sender, messages } of unread.groups) {
  console.log(`Processing ${messages.length} unread from ${sender}`);

  for (const msg of messages) {
    // Process each unread message
  }
}
```

### Pattern: Group Chat Discovery

```typescript
const groups = await sdk.listChats({ type: 'group' });

for (const chat of groups) {
  console.log(`Group: ${chat.displayName}`);
  console.log(`  Chat ID: ${chat.chatId}`);
  console.log(`  Unread: ${chat.unreadCount}`);
}
```

### Pattern: Attachment Downloader

```typescript
import { attachmentExists, downloadAttachment } from '@photon-ai/imessage-kit';

const messages = await sdk.getMessages({ hasAttachments: true, limit: 10 });

for (const msg of messages.messages) {
  for (const attachment of msg.attachments) {
    if (await attachmentExists(attachment)) {
      await downloadAttachment(
        attachment,
        `/path/to/save/${attachment.fileName}`
      );
    }
  }
}
```
