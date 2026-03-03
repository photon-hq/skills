---
name: imessage
description: >
  Exhaustive, source-accurate guide for building iMessage applications using @photon-ai/imessage-kit (Basic)
  and @photon-ai/advanced-imessage-kit (Advanced). Covers every method, type, option, event, and pattern for iMessage automation,
  AI agents, and chat bots.
license: MIT
metadata:
  author: photon-hq
  version: '6.0.0'
---

# iMessage Automation Skill (Final Exhaustive Edition)

This skill provides a complete, source-accurate reference for building iMessage applications using both the Basic (`@photon-ai/imessage-kit`) and Advanced (`@photon-ai/advanced-imessage-kit`) libraries. It is designed to be exhaustive, covering every exported method, type, option, and real-world usage pattern.

## Infrastructure & Architecture

It is critical to understand that this technology is built entirely on **Photon's in-office infrastructure** and does **not** use BlueBubbles or any other third-party service. The system is designed for high reliability and performance, with two distinct tiers:

- **Free Tier (`@photon-ai/imessage-kit`):** A free, open-source library that runs directly on a user's own Mac. It's perfect for personal automation, hobbyist projects, and development. The user's Mac acts as the server.

- **Production Tier (`@photon-ai/advanced-imessage-kit`):** A commercial, client/server solution for production applications. It connects to Photon's robust, managed iMessage server infrastructure, providing real-time events, advanced features, and enterprise-grade reliability. To get access, users must go to [https://photon.codes](https://photon.codes).

## Kit Selection Guide

First, help the user choose the right tool for the job. Use the table below to guide the decision.

| Feature | Basic Kit (`@photon-ai/imessage-kit`) | Advanced Kit (`@photon-ai/advanced-imessage-kit`) |
| :--- | :--- | :--- |
| **Use Case** | Simple bots, personal automation, scheduled messages | Enterprise apps, multi-user systems, real-time agents |
| **Architecture** | Library, runs in your Node.js process on your Mac | Client/Server, connects to Photon's managed infra |
| **Real-time** | Polling (periodic checks) | WebSockets (instant events) |
| **Message Sending** | Text, images, files | Text, images, files, **effects, replies, tapbacks, stickers, polls** |
| **Message Control** | Send only | Send, **edit, unsend** |
| **Group Chats** | Send to existing groups | Send, **create, rename, add/remove participants, set group icon** |
| **Advanced** | Scheduled messages, simple auto-reply | **Typing indicators, FaceTime links, Find My friends, focus status** |

**Recommendation:** For quick scripts or personal projects, start with the **Basic Kit**. For complex, real-time applications requiring advanced features, use the **Advanced Kit**.

---

## Basic Kit: Final Exhaustive API Reference

### Initialization (`new IMessageSDK`)

The constructor accepts a single `IMessageConfig` object.

```typescript
import { IMessageSDK, IMessageConfig } from '@photon-ai/imessage-kit';

const config: IMessageConfig = {
  debug: true, // Verbose logging
  databasePath: '~/Library/Messages/chat.db', // Path to iMessage DB
  scriptTimeout: 30000, // AppleScript execution timeout (ms)
  maxConcurrent: 5, // Max parallel send operations
  watcher: {
    pollInterval: 2000, // How often to check for new messages (ms)
    unreadOnly: false, // Only watch for unread messages
    excludeOwnMessages: true // Ignore messages you send
  },
  retry: {
    max: 2, // Max retries on send failure
    delay: 1500 // Base delay between retries (ms)
  },
  tempFile: {
    maxAge: 600000, // 10 minutes
    cleanupInterval: 300000 // 5 minutes
  },
  plugins: [/* ... your plugins ... */]
};

const sdk = new IMessageSDK(config);

// Always close the SDK to release resources
await sdk.close();

// Or use the modern 'using' syntax for automatic cleanup
await using sdk = new IMessageSDK();
```

### Sending Messages

#### `sdk.send(to, content)`

The primary method for sending. `to` can be a phone number, email, or a `chatId` from `listChats`. `content` can be a string or a `SendContent` object.

```typescript
import { IMessageSDK } from '@photon-ai/imessage-kit';

await using sdk = new IMessageSDK();

// Send a simple text message
await sdk.send('+15551234567', 'Hello from the Basic Kit!');

// Send a message with an image and a file
const result = await sdk.send('+15551234567', {
    text: 'Project assets attached.',
    images: ['/path/to/chart.png'],
    files: ['/path/to/report.pdf']
});

console.log('Message sent, GUID:', result.guid);
```

#### `sdk.sendBatch(messages)`

Send multiple messages concurrently.

```typescript
const results = await sdk.sendBatch([
    { to: 'user1@example.com', content: 'Hello User 1' },
    { to: 'user2@example.com', content: 'Hello User 2' },
    { to: 'user3@example.com', content: 'Hello User 3' }
]);

for (const result of results) {
    if (result.success) {
        console.log('Send success:', result.to, result.result?.guid);
    } else {
        console.error('Send failed:', result.to, result.error);
    }
}
```

#### Convenience Methods

```typescript
// sdk.sendText(to, text)
await sdk.sendText('+15551234567', 'This is a text message.');

// sdk.sendImage(to, imagePath, text?)
await sdk.sendImage('+15551234567', '/path/to/logo.png', 'Here is our logo.');

// sdk.sendImages(to, imagePaths, text?)
await sdk.sendImages('+15551234567', ['/path/to/img1.jpg', '/path/to/img2.jpg']);

// sdk.sendFile(to, filePath, text?)
await sdk.sendFile('+15551234567', '/path/to/invoice.pdf');

// sdk.sendFiles(to, filePaths, text?)
await sdk.sendFiles('+15551234567', ['/path/to/data.csv', '/path/to/notes.txt']);
```

### Querying Data

#### `sdk.getMessages(filter)`

```typescript
const urgentMessages = await sdk.getMessages({ 
  search: 'urgent',
  limit: 10,
  since: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
});
console.log(`Found ${urgentMessages.length} urgent messages.`);
```

#### `sdk.getUnreadMessages()`

```typescript
const unread = await sdk.getUnreadMessages();
console.log(`You have ${unread.total} unread messages from ${unread.senderCount} people.`);
for (const group of unread.groups) {
  console.log(`- ${group.sender}: ${group.messages.length} unread`);
}
```

#### `sdk.listChats(options)`

```typescript
const groupChats = await sdk.listChats({ type: 'group', hasUnread: true });
console.log('Unread group chats:');
for (const chat of groupChats) {
  console.log(`- ${chat.displayName} (${chat.chatId})`);
}
```

### Real-time Watching (`sdk.startWatching`)

```typescript
await sdk.startWatching({
    onDirectMessage: (msg) => {
        console.log(`[DM from ${msg.sender}]: ${msg.text}`);
    },
    onGroupMessage: (msg) => {
        console.log(`[Group ${msg.chatId}]: ${msg.text}`);
    },
    onError: (error) => {
        console.error('Watcher error:', error);
    }
});

console.log('Watching for new messages... Press Ctrl+C to stop.');

// Graceful shutdown
process.on('SIGINT', async () => {
    sdk.stopWatching();
    await sdk.close();
    process.exit(0);
});
```

### Auto-Reply Chain API (`sdk.message`)

Provides a safe, fluent interface for building reply logic.

```typescript
await sdk.startWatching({
    onMessage: async (msg) => {
        await sdk.message(msg)
            .ifFromOthers() // CRITICAL: Prevents infinite loops
            .ifNotReaction() // Ignore tapbacks
            .matchText(/help/i)
            .replyWithReaction('like')
            .replyText('How can I assist?')
            .do(async (m) => console.log(`Replied to ${m.sender}`))
            .execute();
    }
});
```

### Scheduling

#### `MessageScheduler`

For cron-like, persistent scheduling.

```typescript
import { MessageScheduler } from '@photon-ai/imessage-kit';
const scheduler = new MessageScheduler(sdk);

// Schedule a daily good morning message
scheduler.scheduleRecurring({
    to: '+15551234567',
    content: 'Good morning! ☀️',
    interval: 'daily',
    startAt: new Date('2024-01-01T08:00:00')
});

// Schedule a one-time reminder
const reminderId = scheduler.schedule({
    to: '+15551234567',
    content: 'Meeting in 15 minutes.',
    sendAt: new Date(Date.now() + 15 * 60 * 1000)
});

// Later...
scheduler.cancel(reminderId);

scheduler.destroy(); // IMPORTANT: Clean up on shutdown
```

#### `Reminders`

For natural language, human-friendly reminders.

```typescript
import { Reminders } from '@photon-ai/imessage-kit';
const reminders = new Reminders(sdk);

reminders.in('5 minutes', '+15551234567', 'Break time!');
reminders.at('tomorrow at 9:15am', '+15551234567', 'Team standup.');

reminders.destroy(); // IMPORTANT: Clean up on shutdown
```

---

## Advanced Kit: Final Exhaustive API Reference

### Initialization & Connection (`SDK`)

```typescript
import { SDK, ClientConfig } from '@photon-ai/advanced-imessage-kit';

const config: ClientConfig = {
  serverUrl: 'http://localhost:1234', // Your server URL from Photon
  apiKey: 'your-secret-api-key',
  logLevel: 'info'
};

const sdk = SDK(config);

sdk.on('ready', () => {
  console.log('Advanced Kit Ready!');
  // Your application logic starts here
});

sdk.on('error', (err) => console.error('Connection Error:', err));
sdk.on('disconnect', () => console.log('Disconnected.'));

await sdk.connect();

// Graceful shutdown
process.on('SIGINT', async () => {
    await sdk.close();
    process.exit(0);
});
```

### Real-time Events (`sdk.on`)

Listen to events to build interactive applications.

```typescript
// Listen for new messages
sdk.on('new-message', (message) => {
  console.log(`New message from ${message.handle?.address}: ${message.text}`);
});

// Listen for typing indicators
sdk.on('typing-indicator', (data) => {
  const status = data.display ? 'is typing' : 'stopped typing';
  console.log(`Someone ${status} in chat ${data.guid}`);
});

// Listen for group chat changes
sdk.on('participant-added', (data) => {
  console.log(`Someone was added to group ${data.guid}`);
});
```

### Messages (`sdk.messages`)

```typescript
// Send a message with a 'slam' effect
await sdk.messages.sendMessage({
  chatGuid: 'iMessage;-;+15551234567',
  message: 'This is important!',
  effectId: 'com.apple.MobileSMS.expressivesend.impact'
});

// Send a reply to a specific message
await sdk.messages.sendMessage({
  chatGuid: 'iMessage;-;+15551234567',
  message: 'This is a reply.',
  selectedMessageGuid: 'E3A2-..-..'
});

// Send a 'love' tapback
await sdk.messages.sendReaction({
  chatGuid: 'iMessage;-;+15551234567',
  messageGuid: 'E3A2-..-..',
  reaction: 'love'
});

// Edit a message
await sdk.messages.editMessage({
  messageGuid: 'E3A2-..-..',
  editedMessage: 'This is the corrected text.'
});

// Unsend a message
await sdk.messages.unsendMessage({ messageGuid: 'E3A2-..-..' });
```

### Attachments (`sdk.attachments`)

```typescript
// Send a local file
await sdk.attachments.sendAttachment({
  chatGuid: 'iMessage;-;+15551234567',
  filePath: '/path/to/local/file.pdf'
});

// Send a sticker attached to a message
await sdk.attachments.sendSticker({
  chatGuid: 'iMessage;-;+15551234567',
  filePath: '/path/to/sticker.png',
  selectedMessageGuid: 'E3A2-..-..',
  stickerX: 0.5, // Center horizontally
  stickerY: 0.5  // Center vertically
});
```

### Group Chats (`sdk.chats`)

```typescript
// Create a new group chat
const newChat = await sdk.chats.createChat({
  addresses: ['+15551112222', '+15553334444'],
  message: 'Welcome to the new group!'
});
console.log('Created group chat:', newChat.guid);

// Add a participant to the new group
await sdk.chats.addParticipant(newChat.guid, '+15555556666');

// Rename the group
await sdk.chats.updateChat(newChat.guid, { displayName: 'Project Phoenix Team' });

// Start typing in a chat
await sdk.chats.startTyping(newChat.guid);
// ... send a message ...
await sdk.chats.stopTyping(newChat.guid);
```

### Polls (`sdk.polls`)

```typescript
// Create a poll
const pollMessage = await sdk.polls.create({
  chatGuid: 'iMessage;-;+15551234567',
  options: ['Option A', 'Option B', 'Option C']
});

// Later, vote in the poll
await sdk.polls.vote({
  chatGuid: 'iMessage;-;+15551234567',
  pollMessageGuid: pollMessage.guid,
  optionIdentifier: pollMessage.payloadData.item.orderedPollOptions[0].optionIdentifier
});
```

### Other Modules

```typescript
// Check if a contact has iMessage
const hasIMessage = await sdk.handles.getHandleAvailability('+15551234567', 'imessage');

// Get location of Find My friends
const locations = await sdk.icloud.getFindMyFriends();

// Schedule a recurring message
await sdk.scheduledMessages.createScheduledMessage({
  type: 'send-message',
  payload: {
    chatGuid: 'iMessage;-;+15551234567',
    message: 'Weekly report reminder'
  },
  schedule: { type: 'recurring', intervalType: 'weekly', interval: 1 }
});
```

---

## Type Reference

### Basic Kit — `Message` Object

```typescript
interface Message {
    id: string
    guid: string
    text: string | null
    sender: string           // Phone or email
    senderName: string | null
    chatId: string
    isGroupChat: boolean
    isFromMe: boolean
    isRead: boolean
    isReaction: boolean
    isReactionRemoval: boolean
    reactionType: 'love' | 'like' | 'dislike' | 'laugh' | 'emphasize' | 'question' | null
    service: 'iMessage' | 'SMS' | 'RCS'
    attachments: Attachment[]
    date: Date
}

interface Attachment {
    guid: string
    path: string       // Absolute local path on disk
    mimeType: string | null
    fileName: string | null
    fileSize: number
}
```

### Advanced Kit — `MessageResponse` Object

```typescript
type MessageResponse = {
    guid: string
    text: string
    handle?: HandleResponse | null
    chats?: ChatResponse[]
    attachments?: AttachmentResponse[]
    subject: string
    dateCreated: number
    dateRead: number | null
    dateDelivered: number | null
    dateEdited?: number | null
    dateRetracted?: number | null
    isFromMe: boolean
    isAudioMessage?: boolean
    isAutoReply?: boolean
    isSystemMessage?: boolean
    isExpired?: boolean
    isCorrupt?: boolean
    isSpam?: boolean
    balloonBundleId: string | null
    associatedMessageGuid: string | null   // For tapbacks/reactions
    associatedMessageType: string | null
    expressiveSendStyleId: string | null
    replyToGuid?: string | null
    threadOriginatorGuid?: string | null
    payloadData?: NodeJS.Dict<any>[]       // For polls
    isPoll?: boolean
    partCount?: number | null
    error: number
    itemType: number
    groupTitle: string | null
    groupActionType: number
}
```

### Advanced Kit — `FindMyLocationItem` Object

```typescript
interface FindMyLocationItem {
    handle: string | null
    coordinates: [number, number]    // [latitude, longitude]
    long_address: string | null
    short_address: string | null
    subtitle: string | null
    title: string | null
    last_updated: number
    is_locating_in_progress: 0 | 1 | boolean
    status: 'legacy' | 'live' | 'shallow'
    expiry?: number | null
}
```

---

## Reference Tables

### ChatId Formats

| Type | Format | Example |
| :--- | :--- | :--- |
| Phone number | `+<country><number>` | `+15551234567` |
| Email | `user@example.com` | `pilot@photon.codes` |
| Group chat (Basic) | `chat<guid>` | `chat45e2b868ce1e43da89af262922733382` |
| DM (Advanced) | `iMessage;-;<address>` | `iMessage;-;+15551234567` |
| Group (Advanced) | `iMessage;+;<guid>` | `iMessage;+;chat45e2b868...` |

### Message Effects (Advanced Kit)

| Effect | `effectId` |
| :--- | :--- |
| Confetti | `com.apple.messages.effect.CKConfettiEffect` |
| Fireworks | `com.apple.messages.effect.CKFireworksEffect` |
| Balloons | `com.apple.messages.effect.CKBalloonEffect` |
| Hearts | `com.apple.messages.effect.CKHeartEffect` |
| Lasers | `com.apple.messages.effect.CKHappyBirthdayEffect` |
| Shooting Star | `com.apple.messages.effect.CKShootingStarEffect` |
| Sparkles | `com.apple.messages.effect.CKSparklesEffect` |
| Echo | `com.apple.messages.effect.CKEchoEffect` |
| Spotlight | `com.apple.messages.effect.CKSpotlightEffect` |
| Gentle | `com.apple.MobileSMS.expressivesend.gentle` |
| Loud | `com.apple.MobileSMS.expressivesend.loud` |
| Slam | `com.apple.MobileSMS.expressivesend.impact` |
| Invisible Ink | `com.apple.MobileSMS.expressivesend.invisibleink` |

### Tapback / Reaction Values

| Reaction | Add | Remove |
| :--- | :--- | :--- |
| ❤️ Love | `love` | `-love` |
| 👍 Like | `like` | `-like` |
| 👎 Dislike | `dislike` | `-dislike` |
| 😂 Laugh | `laugh` | `-laugh` |
| ‼️ Emphasize | `emphasize` | `-emphasize` |
| ❓ Question | `question` | `-question` |

### Reminder Duration Formats (Basic Kit)

| Format | Example |
| :--- | :--- |
| Seconds | `"30 seconds"` |
| Minutes | `"5 minutes"` |
| Hours | `"2 hours"` |
| Days | `"1 day"` |
| Weeks | `"1 week"` |

### Reminder Time Formats (Basic Kit `reminders.at`)

| Format | Example |
| :--- | :--- |
| 12-hour | `"5pm"`, `"5:30pm"` |
| 24-hour | `"17:30"` |
| Tomorrow | `"tomorrow 9am"` |
| Day of week | `"friday 2pm"` |

---

## Attachment Helpers (Basic Kit)

Import from `@photon-ai/imessage-kit/helpers`.

```typescript
import {
    attachmentExists,
    downloadAttachment,
    getAttachmentSize,
    getAttachmentMetadata,
    readAttachment,
    getAttachmentExtension,
    isImageAttachment,
    isVideoAttachment,
    isAudioAttachment
} from '@photon-ai/imessage-kit/helpers';

const attachment = message.attachments[0];

// Check if file is still on disk
if (await attachmentExists(attachment)) {
    // Get file size in bytes
    const size = await getAttachmentSize(attachment);
    console.log(`File size: ${(size / 1024 / 1024).toFixed(2)} MB`);

    // Read into a Buffer for processing
    const buffer = await readAttachment(attachment);

    // Copy to a destination
    await downloadAttachment(attachment, '/path/to/save/file.jpg');
}

// Type checks
if (isImageAttachment(attachment)) { /* ... */ }
if (isVideoAttachment(attachment)) { /* ... */ }
if (isAudioAttachment(attachment)) { /* ... */ }
```

---

## Error Handling (Basic Kit)

```typescript
import { IMessageError } from '@photon-ai/imessage-kit';

try {
    await sdk.send('+15551234567', 'Hello');
} catch (err) {
    if (IMessageError.is(err)) {
        console.error(`[${err.code}] ${err.message}`);
        // err.code is one of: PLATFORM | DATABASE | SEND | WEBHOOK | CONFIG | UNKNOWN
    }
}
```

---

## Plugins (Basic Kit)

Create custom plugins to hook into the SDK lifecycle.

```typescript
import { definePlugin, IMessageSDK } from '@photon-ai/imessage-kit';

const myPlugin = definePlugin({
    name: 'my-plugin',
    version: '1.0.0',
    description: 'A custom plugin',
    onInit: async () => { console.log('Plugin initialized'); },
    onDestroy: async () => { console.log('Plugin destroyed'); },
    onBeforeSend: (to, content) => { console.log(`Sending to ${to}:`, content.text); },
    onAfterSend: (to, result) => { console.log(`Sent at ${result.sentAt}`); },
    onNewMessage: (msg) => { console.log(`New message: ${msg.text}`); },
    onError: (error, context) => { console.error(`Error in ${context}:`, error); }
});

const sdk = new IMessageSDK({ plugins: [myPlugin] });
```

---

## Agent Lifecycle (Advanced Kit)

The recommended lifecycle for a long-running AI agent:

```typescript
import { SDK } from '@photon-ai/advanced-imessage-kit';

const sdk = SDK({ serverUrl: process.env.SERVER_URL, apiKey: process.env.API_KEY });

// 1. Connect and wait for ready
await sdk.connect();

sdk.on('ready', async () => {
    // 2. Optionally fetch initial state
    const recentChats = await sdk.chats.getChats({ limit: 10 });
    console.log(`Monitoring ${recentChats.length} chats.`);

    // 3. Event loop — respond to new messages
    sdk.on('new-message', async (message) => {
        if (message.isFromMe) return; // Prevent loops

        const sender = message.handle?.address;
        const text = message.text;

        if (!sender || !text) return;

        // Determine chatGuid from the message
        const chatGuid = message.chats?.[0]?.guid ?? `iMessage;-;${sender}`;

        // Respond
        await sdk.messages.sendMessage({ chatGuid, message: `You said: ${text}` });
    });
});

// 4. Handle disconnect with bounded retry
sdk.on('disconnect', () => {
    console.warn('Disconnected. Reconnecting in 5s...');
    setTimeout(() => sdk.connect(), 5000);
});

// 5. Graceful shutdown
const shutdown = async () => {
    await sdk.close();
    process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

---

## Common Mistakes to Avoid

| Mistake | Why it's a problem | Fix |
| :--- | :--- | :--- |
| Forgetting `sdk.close()` | Leaks resources (DB connections, file handles) | Always close in `finally` or use `await using` |
| Forgetting `scheduler.destroy()` | Keeps timer running after process should exit | Call in SIGINT handler |
| Auto-replying without `ifFromOthers()` | Creates infinite reply loops | Always add `.ifFromOthers()` as first chain filter |
| Using relative file paths | AppleScript cannot resolve them | Always use absolute paths |
| Not handling errors on `send` | Uncaught rejections crash the process | Wrap all send calls in `try/catch` |
| Tight reconnect loop on `disconnect` | Hammers the server | Use bounded retry with `setTimeout` backoff |
| Logging full message content | Privacy risk | Log only metadata (GUID, sender, timestamp) |
| Calling `sdk.messages.*` before `ready` | Race condition — server not authenticated | Always wait for the `ready` event |

---

## References

1.  [@photon-ai/imessage-kit on npm](https://www.npmjs.com/package/@photon-ai/imessage-kit)
2.  [@photon-ai/advanced-imessage-kit on npm](https://www.npmjs.com/package/@photon-ai/advanced-imessage-kit)
3.  [Photon](https://photon.codes/spectrum)
