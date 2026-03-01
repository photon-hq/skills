---
title: Advanced Kit Typing Indicators
impact: LOW
impactDescription: Provides visual feedback to users that the bot is active.
tags: [advanced, typing, indicator]
---

## Advanced Kit: Typing Indicators

The Advanced Kit can show and hide the typing indicator (`...`) in a conversation, providing a useful visual cue to users that your bot or agent is processing their request and preparing a response.

### Showing the Typing Indicator

To display the typing indicator, call the `startTyping` method with the `chatGuid` of the conversation.

```typescript
import { SDK } from "@photon-ai/advanced-imessage-kit";
const sdk = SDK({ serverUrl: "...", apiKey: "..." });
await sdk.connect();

const chatGuid = "iMessage;-;+15551234567";

// Show the indicator before starting a long-running task
await sdk.chats.startTyping({ chatGuid });

// Simulate a long-running process (e.g., calling an LLM)
await new Promise(resolve => setTimeout(resolve, 3000));

// ... then send the response
await sdk.messages.sendMessage({
    chatGuid,
    message: "I have processed your request. Here are the results...",
});
```

### Hiding the Typing Indicator

It is important to manually hide the typing indicator once your operation is complete by calling `stopTyping`. The indicator will not disappear automatically after sending a message.

```typescript
const chatGuid = "iMessage;-;+15551234567";

await sdk.chats.startTyping({ chatGuid });

// ... perform some work ...

// Hide the indicator
await sdk.chats.stopTyping({ chatGuid });
```

### Best Practice: `try...finally`

A robust pattern is to wrap your processing logic in a `try...finally` block. This ensures that the typing indicator is always stopped, even if an error occurs during your processing.

```typescript
const chatGuid = "iMessage;-;+15551234567";

try {
    await sdk.chats.startTyping({ chatGuid });

    // Your main logic here
    const result = await someLongRunningFunction();

    await sdk.messages.sendMessage({
        chatGuid,
        message: `Result: ${result}`,
    });

} catch (error) {
    console.error("An error occurred:", error);
    await sdk.messages.sendMessage({
        chatGuid,
        message: "Sorry, an error occurred while processing your request.",
    });
} finally {
    // Ensure the typing indicator is always stopped
    await sdk.chats.stopTyping({ chatGuid });
}
```
