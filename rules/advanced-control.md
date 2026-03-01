---
title: Advanced Kit Message Control
impact: MEDIUM
impactDescription: Enables editing and unsending messages after they have been sent.
tags: [advanced, edit, unsend, delete, control]
---

## Advanced Kit: Message Control

The Advanced Kit allows you to programmatically edit and unsend messages, mirroring the functionality available in the iMessage app.

### Editing a Message

To edit a previously sent message, use the `editMessage` method. You need the `chatGuid`, the `messageGuid` of the message to be edited, and the `editedMessage` text.

```typescript
import { SDK } from "@photon-ai/advanced-imessage-kit";
const sdk = SDK({ serverUrl: "...", apiKey: "..." });
await sdk.connect();

// First, send a message
const sentMessage = await sdk.messages.sendMessage({
    chatGuid: "iMessage;-;+15551234567",
    message: "Hlelo world!", // Oops, a typo
});

// Now, edit the message to correct the typo
if (sentMessage) {
    await sdk.messages.editMessage({
        chatGuid: "iMessage;-;+15551234567",
        messageGuid: sentMessage.guid,
        editedMessage: "Hello world!",
    });
    console.log(`Message ${sentMessage.guid} edited successfully.`);
}
```

### Unsending a Message

To unsend (delete) a message, use the `unsendMessage` method. This will remove the message from the conversation for all participants (if they are on a compatible iMessage version).

```typescript
// Assume we have a messageGuid from a previously sent message
const messageToUnsendGuid = "p01/GUID-OF-MESSAGE-TO-UNSEND";

await sdk.messages.unsendMessage({
    chatGuid: "iMessage;-;+15551234567",
    messageGuid: messageToUnsendGuid,
});

console.log(`Message ${messageToUnsendGuid} has been unsent.`);
```

### Important Considerations

-   **Permissions:** The ability to edit or unsend messages depends on the permissions of the account running the Advanced Kit server.
-   **iMessage Version:** These features only work if the recipients are also using a version of iMessage that supports message editing and unsending.
-   **Timing:** There is a limited time window within which a message can be edited or unsent after it has been delivered.
