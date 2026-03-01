---
title: Advanced Kit Group Chat Management
impact: HIGH
impactDescription: Provides full control over iMessage group conversations.
tags: [advanced, group, chat, participants, rename]
---

## Advanced Kit: Group Chat Management

The Advanced Kit provides a comprehensive `chats` API to create, rename, and manage participants in group conversations.

### Creating a New Group Chat

Use the `createChat` method to start a new group conversation. Provide an array of participant addresses (phone numbers or emails).

```typescript
import { SDK } from "@photon-ai/advanced-imessage-kit";
const sdk = SDK({ serverUrl: "...", apiKey: "..." });
await sdk.connect();

const newGroup = await sdk.chats.createChat({
    participants: ["+15551112222", "+15553334444"],
});

console.log(`Created new group chat with GUID: ${newGroup.guid}`);

// You can now send a message to the new group
await sdk.messages.sendMessage({
    chatGuid: newGroup.guid,
    message: "Welcome to the new project group!",
});
```

### Adding a Participant

Use `addParticipant` to add a new member to an existing group chat.

```typescript
const chatGuid = "iMessage;+;chat_group_guid";

await sdk.chats.addParticipant({
    chatGuid: chatGuid,
    participant: "+15557778888", // Address of the new participant
});

console.log("Participant added successfully.");
```

### Removing a Participant

Use `removeParticipant` to remove a member from a group chat.

```typescript
const chatGuid = "iMessage;+;chat_group_guid";

await sdk.chats.removeParticipant({
    chatGuid: chatGuid,
    participant: "+15553334444", // Address of the participant to remove
});

console.log("Participant removed successfully.");
```

### Renaming a Group Chat

Use the `renameChat` method to change the name of a group conversation.

```typescript
const chatGuid = "iMessage;+;chat_group_guid";

await sdk.chats.renameChat({
    chatGuid: chatGuid,
    newName: "Project Apollo Team",
});

console.log("Group chat renamed.");
```
