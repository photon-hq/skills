---
title: General Best Practices
impact: MEDIUM
impactDescription: Guidelines for building robust, secure, and efficient iMessage applications.
tags: [best-practices, security, performance, error-handling]
---

## General Best Practices

These best practices apply to both the Basic and Advanced iMessage Kits and are crucial for building reliable applications.

### Graceful Shutdown

Always ensure you properly close connections and destroy timers to prevent resource leaks and ensure your application can shut down cleanly.

**Basic Kit:**
```typescript
// Close the main SDK connection
await sdk.close();

// If using schedulers or reminders, destroy them
scheduler.destroy();
reminders.destroy();
```

**Advanced Kit:**
```typescript
// The `sdk.close()` method handles the WebSocket disconnection.
// It's best to call this in a process exit handler.
process.on("SIGINT", async () => {
  await sdk.close();
  process.exit(0);
});
```

### Preventing Auto-Reply Loops

When building an auto-reply bot, it is **critical** to prevent it from replying to its own messages, which would create an infinite loop.

**Basic Kit (Recommended):**

The `message` chain API has a built-in safeguard.
```typescript
await sdk.message(msg)
  .ifFromOthers() // This method prevents replying to self
  .matchText(/hello/i)
  .replyText("Hi there!")
  .execute();
```

**Advanced Kit (Manual Check):**

You must manually check the `isFromMe` property on the incoming message object.
```typescript
sdk.on("new-message", async (message) => {
    if (message.isFromMe) {
        return; // Do not process messages sent by the bot
    }
    // Your reply logic here
});
```

### Robust Error Handling

Network requests and file system operations can fail. Always wrap SDK calls in `try...catch` blocks to handle potential errors gracefully.

```typescript
try {
  await sdk.send("+15551234567", "Hello!");
} catch (error) {
  console.error("Failed to send message:", error);
  // Implement retry logic or user notification if necessary
}
```

### Use Absolute Paths for Attachments

When sending file attachments, always use absolute paths to avoid ambiguity and ensure the SDK can locate the files regardless of the current working directory.

**Correct:**
```typescript
await sdk.send("+15551234567", { files: ["/Users/me/Documents/report.pdf"] });
```

**Incorrect:**
```typescript
await sdk.send("+15551234567", { files: ["./report.pdf"] });
```
