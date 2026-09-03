# Advanced iMessage messages

`im.messages` sends, reads, mutates, and subscribes to messages. Methods scoped to a conversation take `chat.guid`, not an email address or phone number.

## Core operations

| Need | Current method |
|---|---|
| Send text | `im.messages.sendText(chat.guid, text, options?)` |
| Send an uploaded file | `im.messages.sendAttachment(chat.guid, attachmentGuid, options?)` |
| Send a customized iMessage App card | `im.messages.sendCustomizedMiniApp(chat.guid, message, options?)` |
| Send multipart text, mentions, and files | `im.messages.sendMultipart(chat.guid, parts, options?)` |
| Add or remove a reaction | `im.messages.setReaction(chat.guid, messageGuid, reaction, add, options?)` |
| Place a sticker | `im.messages.placeSticker(chat.guid, messageGuid, attachmentGuid, placement)` |
| Edit | `im.messages.edit(chat.guid, messageGuid, text, options?)` |
| Unsend | `im.messages.unsend(chat.guid, messageGuid, options?)` |
| Notify Anyway | `im.messages.notifySilenced(chat.guid, messageGuid)` |
| Get one | `im.messages.get(messageGuid)` |
| List recent across chats | `im.messages.listRecent(options?)` |
| List within one chat | `im.messages.listInChat(chat.guid, options?)` |
| Embedded Digital Touch or handwriting media | `im.messages.getEmbeddedMedia(chat.guid, messageGuid)` |
| Subscribe | `im.messages.subscribeEvents(filter?)` |

## Text, effects, and formatting

```ts
import { MessageEffect, TextEffect } from "@photon-ai/advanced-imessage";

const sent = await im.messages.sendText(chat.guid, "Bold then bloom", {
  effect: MessageEffect.confetti,
  formatting: [
    { type: "bold", start: 0, length: 4 },
    { type: "effect", start: 10, length: 5, effect: TextEffect.bloom },
  ],
  clientMessageId: `send-${job.id}`,
});
```

`MessageEffect` includes `confetti`, `fireworks`, `balloons`, `heart`, `lasers`, `celebration`, `sparkles`, `spotlight`, `echo`, `slam`, `loud`, `gentle`, and `invisible`. Formatting ranges use UTF-16 code units. Emoji and other non-BMP characters can occupy two units.

## Attachments and audio messages

Upload bytes first, then send the returned server GUID:

```ts
const uploaded = await im.attachments.upload({
  fileName: "voice.m4a",
  data: await readFile("voice.m4a"),
});

await im.messages.sendAttachment(chat.guid, uploaded.attachment.guid, {
  isAudioMessage: true,
});
```

The attachment argument is never a local path.

## Replies and multipart targets

```ts
await im.messages.sendText(chat.guid, "Replying here", {
  replyTo: sent.guid,
});

await im.messages.sendText(chat.guid, "Replying to bubble 2", {
  replyTo: { guid: multipart.guid, partIndex: 1 },
});
```

`replyTo` is supported by text, attachment, and multipart sends. `partIndex` is zero-based.

## Reactions and stickers

```ts
await im.messages.setReaction(chat.guid, sent.guid, { kind: "love" }, true);
await im.messages.setReaction(chat.guid, sent.guid, { kind: "emoji", emoji: "👍" }, true);
await im.messages.setReaction(chat.guid, sent.guid, { kind: "love" }, false);
```

Built-in kinds are `love`, `like`, `dislike`, `laugh`, `emphasize`, `question`, and `emoji`. Stickers use normalized placement coordinates near `0.5, 0.5`, not screen pixels.

## Edit and unsend windows

| Operation | Apple window | Return |
|---|---:|---|
| `edit(...)` | 15 minutes | Updated `Message` |
| `unsend(...)` | 2 minutes | `void` |

Expired operations throw. Use `backwardCompatText` for older clients and `clientMessageId` for idempotent worker retries.

## Query and pagination

```ts
let pageToken: string | undefined;
do {
  const page = await im.messages.listInChat(chat.guid, {
    pageSize: 50,
    pageToken,
    isFromMe: false,
  });
  for (const message of page.messages) console.log(message.guid);
  pageToken = page.nextPageToken;
} while (pageToken);
```

`pageSize` is `1..100`. Filters include `after`, `before`, `isFromMe`, and `isRead`.

## Events

```ts
for await (const event of im.messages.subscribeEvents({ chat: chat.guid })) {
  switch (event.type) {
    case "message.received":
      console.log(event.message.guid);
      break;
    case "message.edited":
    case "message.unsent":
      console.log(event.messageGuid, event.sequence);
      break;
  }
}
```

Persist opaque message GUIDs and event sequences unchanged. Recover missed durable events with `im.events.catchUp(...)`.

Official source: <https://photon.codes/docs/advanced-kits/imessage/messages>
