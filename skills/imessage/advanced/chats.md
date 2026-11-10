# Advanced iMessage chats

`im.chats` manages direct and group conversations. Use returned `chat.guid` values instead of hand-writing GUIDs.

## Create, get, and count

```ts
const { chat, initialMessage } = await im.chats.create(["+15551234567"], {
  message: "Hello",
  clientMessageId: `chat-${job.id}`,
});

const current = await im.chats.get(chat.guid);
const activeCount = await im.chats.count();
const allCount = await im.chats.count({ includeArchived: true });
```

One address creates a direct chat. Two or more create a group. Addresses must be full email addresses or E.164 phone numbers. Duplicates, short codes, and invalid addresses are rejected. `get(...)` throws `NotFoundError` when the chat is unavailable.

## Read and typing state

```ts
await im.chats.markRead(chat.guid);
await im.chats.setTyping(chat.guid, true);
try {
  await doSlowWork();
} finally {
  await im.chats.setTyping(chat.guid, false);
}
```

Typing is temporary UI state and is not part of the durable event log.

## Share the account contact card

```ts
await im.chats.shareContactInfo(chat.guid);
```

The card comes from the account running the service. The SDK does not choose individual vCard fields.

## Backgrounds

Background APIs accept raw image bytes, not attachment GUIDs.

```ts
await im.chats.setBackground(chat.guid, await readFile("background.jpg"));
const hasCustom = await im.chats.hasBackground(chat.guid);
await im.chats.removeBackground(chat.guid);
```

JPEG, PNG, HEIC, and HEIF are supported. Distribution happens through iCloud after the call succeeds and can take roughly 30 seconds or longer depending on network, iCloud, Messages state, and Apple trust rules. Repeatedly setting the same background is not a reliable fix for a recipient-side display issue.

## Events

```ts
for await (const event of im.chats.subscribeEvents({ chat: chat.guid })) {
  switch (event.type) {
    case "chat.backgroundChanged":
    case "chat.backgroundRemoved":
    case "chat.markedRead":
    case "chat.archived":
    case "chat.unarchived":
      console.log(event.sequence, event.type);
      break;
  }
}
```

Immediately after a write, trust the method result or completion status. Event streams are for changes from other participants, devices, or workers. Recover missed durable chat events through `im.events.catchUp(...)`.

Official source: <https://photon.codes/docs/advanced-kits/imessage/chats>
