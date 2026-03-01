---
title: iMessage Kit Best Practices
impact: MEDIUM
impactDescription: Guidelines for building robust, secure, and efficient iMessage applications.
tags: [best-practices, security, performance, error-handling]
---

# iMessage Kit Best Practices

These guidelines apply to both the Basic and Advanced iMessage Kits and are crucial for building reliable, secure, and efficient applications.

## 1. Graceful Shutdown

Always ensure you properly close connections and destroy timers to prevent resource leaks and allow your application to shut down cleanly.

-   **Basic Kit (`IMessageSDK`):** Call `await sdk.close()` to release the database lock. If you are using `MessageScheduler` or `Reminders`, you must also call `destroy()` on those instances to clear any pending timers.
-   **Advanced Kit (`SDK`):** Call `await sdk.close()` to terminate the WebSocket connection. It is best practice to place this call inside a process exit handler (e.g., `process.on("SIGINT", ...)`) to ensure it runs even if the application is interrupted.

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
  await sdk.send("+15551234567", "Hello!");
} catch (error) {
  console.error("Failed to send message:", error);
  // Implement retry logic or user notification if necessary
}
```

## 5. Use Typing Indicators (Advanced Kit)

For a better user experience, use typing indicators to show that your bot is processing a request. Always wrap the logic in a `try...finally` block to ensure the indicator is stopped, even if an error occurs.

```typescript
const chatGuid = "iMessage;-;+15551234567";
try {
    await sdk.chats.startTyping({ chatGuid });
    // ... your logic that might take time ...
    await sdk.messages.sendMessage({ chatGuid, message: "Here is the result." });
} finally {
    await sdk.chats.stopTyping({ chatGuid });
}
```
