# WhatsApp Business messages

Every outbound message uses `client.messages.send(params)`. `params` contains common fields such as `to`, optional `replyTo`, and optional `bizOpaqueCallbackData`, plus exactly one content key.

## Recipient and text

`to` accepts a WhatsApp phone ID in international format, with or without the leading `+`.

```ts
await client.messages.send({
  to: "+15551234567",
  text: { body: "See https://photon.codes", previewUrl: true },
});
```

## Media

```ts
import { readFile } from "node:fs/promises";

const { mediaId } = await client.media.upload({
  file: await readFile("photo.jpg"),
  mimeType: "image/jpeg",
  filename: "photo.jpg",
});

await client.messages.send({
  to,
  image: { id: mediaId, caption: "Here is the photo" },
});

await client.messages.send({
  to,
  document: {
    link: "https://example.com/report.pdf",
    filename: "report.pdf",
  },
});
```

Supported content keys include `image`, `video`, `audio`, `document`, and `sticker`. Media references use either `id` or a public `link`; stickers use WebP and do not take captions.

Apply file-size and MIME validation before `readFile`. For remote links, use an allowlist or trusted storage origin; do not forward an arbitrary URL supplied in an inbound message.

## Location and contacts

```ts
await client.messages.send({
  to,
  location: {
    latitude: 37.422,
    longitude: -122.084,
    name: "Googleplex",
    address: "1600 Amphitheatre Pkwy",
  },
});

await client.messages.send({
  to,
  contacts: [{
    name: {
      formattedName: "Alice Example",
      firstName: "Alice",
    },
    phones: [{ phone: "+15559876543", type: "MOBILE" }],
    emails: [{ email: "alice@example.com" }],
    addresses: [],
    urls: [],
  }],
});
```

Treat contact and location payloads as sensitive user data. Do not log them or reuse them for another recipient without explicit intent.

## Reactions, replies, and read state

```ts
await client.messages.send({
  to,
  reaction: { messageId: inboundId, emoji: "❤️" },
});

await client.messages.send({
  to,
  replyTo: inboundId,
  text: "Replying to your message",
});

await client.messages.markRead(inboundId);
```

Use an empty reaction emoji to remove a reaction.

## Result and cancellation

```ts
const { messageId, messageStatus } = await client.messages.send(
  { to, text: "Hello" },
  { signal: abortController.signal },
);
```

Store `messageId` when you need status tracking, reply, or reaction correlation. Use `bizOpaqueCallbackData` for your own opaque status-correlation data, not secrets or raw user content.

Official source: <https://photon.codes/docs/advanced-kits/whatsapp/messages>
