---
title: Basic Kit Watching for Messages
impact: HIGH
impactDescription: Essential for building interactive bots and automations.
tags: [basic, watch, listen, real-time, bot, polling]
---

## Basic Kit: Watching for New Messages

The Basic Kit uses a polling mechanism to watch for new messages. This is suitable for simple bots and automations that don't require millisecond precision.

### Starting the Watcher

To begin watching for messages, call the `startWatching` method. You must provide an `onMessage` callback function, which will be executed for each new message found.

```typescript
import { IMessageSDK } from "@photon-ai/imessage-kit";
const sdk = new IMessageSDK();

const watcher = await sdk.startWatching({
    onMessage: (message) => {
        console.log(`New message from ${message.sender}: ${message.text}`);
        // Add your message handling logic here
    },
    onError: (error) => {
        console.error("An error occurred in the message watcher:", error);
    },
});

console.log("Message watcher started.");
```

### Auto-Reply Bots with the `message` Chain

The SDK includes a convenient `message` chain API for building simple, readable auto-reply logic. This is the recommended way to handle replies as it includes built-in protection against infinite loops.

```typescript
await sdk.startWatching({
    onDirectMessage: async (msg) => {
        await sdk.message(msg)
            // IMPORTANT: Prevents the bot from replying to its own messages
            .ifFromOthers()
            // Match incoming text (case-insensitive)
            .matchText(/hello/i)
            // Reply with a text message
            .replyText("Hi there! I'm a bot. How can I help?")
            // Execute the chain
            .execute();

        await sdk.message(msg)
            .ifFromOthers()
            .matchText(/help/i)
            .replyText("You can ask me about the weather or tell me a joke.")
            .execute();
    },
});
```

### Stopping the Watcher

It's important to stop the watcher when it's no longer needed to prevent resource leaks.

```typescript
// After starting the watcher...

// To stop it later (e.g., on application shutdown)
sdk.stopWatching();
console.log("Message watcher stopped.");
```

If you stored the return value of `startWatching`, you can also call `destroy()` on it:

```typescript
// watcher is the return value from sdk.startWatching()
watcher.destroy();
```
