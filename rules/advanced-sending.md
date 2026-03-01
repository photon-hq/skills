---
title: Advanced Kit Sending Messages
impact: HIGH
impactDescription: Core functionality for sending messages with advanced features.
tags: [advanced, send, message, effect, reply, tapback, reaction]
---

## Advanced Kit: Sending Messages

The Advanced Kit provides a rich `messages` API for sending content with effects, replies, and reactions (tapbacks).

### Sending a Standard Message

To send a message, you need the `chatGuid` of the target conversation.

```typescript
import { SDK } from "@photon-ai/advanced-imessage-kit";
const sdk = SDK({ serverUrl: "...", apiKey: "..." });
await sdk.connect();

await sdk.messages.sendMessage({
    chatGuid: "iMessage;-;+15551234567", // For a direct message
    message: "Hello from the Advanced Kit!",
});
```

### Replying to a Message

To reply to a specific message, provide its `selectedMessageGuid`.

```typescript
await sdk.messages.sendMessage({
    chatGuid: "iMessage;-;+15551234567",
    message: "This is a reply to your last message.",
    selectedMessageGuid: "p01/GUID-OF-ORIGINAL-MESSAGE",
});
```

### Sending with an Effect

The Advanced Kit supports all iMessage screen and bubble effects. Provide the `effectId` of the desired effect.

**Screen Effects:**

- `com.apple.messages.effect.CKHappyBirthdayEffect`
- `com.apple.messages.effect.CKConfettiEffect`
- `com.apple.messages.effect.CKFireworksEffect`
- `com.apple.messages.effect.CKCelebrationEffect`
- `com.apple.messages.effect.CKEchoEffect`
- `com.apple.messages.effect.CKSpotlightEffect`
- `com.apple.messages.effect.CKLasersEffect`
- `com.apple.messages.effect.CKShootingsstarEffect`

**Bubble Effects:**

- `com.apple.messages.effect.CKInvisibleInkEffect`
- `com.apple.messages.effect.CKGentleEffect`
- `com.apple.messages.effect.CKLoudEffect`
- `com.apple.messages.effect.CKSlamEffect`

```typescript
// Send a message with the Fireworks screen effect
await sdk.messages.sendMessage({
    chatGuid: "iMessage;+;chat_group_guid",
    message: "Happy New Year!",
    effectId: "com.apple.messages.effect.CKFireworksEffect",
});

// Send a message with the Slam bubble effect
await sdk.messages.sendMessage({
    chatGuid: "iMessage;+;chat_group_guid",
    message: "Guess what!",
    effectId: "com.apple.messages.effect.CKSlamEffect",
});
```

### Sending a Reaction (Tapback)

Use the `sendReaction` method to add a tapback to a message. You need the `messageGuid` of the message you want to react to.

**Available Reactions:**

- `love`
- `like`
- `dislike`
- `laugh`
- `emphasize`
- `question`

```typescript
await sdk.messages.sendReaction({
    chatGuid: "iMessage;-;+15551234567",
    messageGuid: "p01/GUID-OF-MESSAGE-TO-REACT-TO",
    reaction: "love",
});
```
