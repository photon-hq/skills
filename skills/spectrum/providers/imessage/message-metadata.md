# Native iMessage message metadata

Cloud iMessage messages expose a curated native metadata surface. Check and narrow the provider before reading it.

```ts
import { imessage } from "spectrum-ts/providers/imessage";

const message = await space.getMessage(messageId);
if (message && imessage.is(message)) {
  console.log({
    id: message.id,
    sent: message.isSent,
    delivered: message.isDelivered,
    deliveredAt: message.dateDelivered,
    readAt: message.dateRead,
    editedAt: message.dateEdited,
    retractedAt: message.dateRetracted,
    sendErrorCode: message.sendErrorCode,
  });
}
```

Metadata groups include:

- delivery and lifecycle state;
- `nativeText`, UTF-16 formatting ranges, mentions, subject, and effect IDs;
- attachment transfer records;
- applied reactions and placed stickers;
- classification fields such as system, spam, corrupt, and expirable state.

Use `nativeText` for mention and formatting offsets; rebuilding ranges from normalized content is unreliable. Attachment metadata describes transfer state, while bytes remain in Spectrum attachment content.

The surface is intentionally curated and does not expose the raw Advanced iMessage database row. Even curated metadata can contain user content and contact information, so prefer stable IDs and status fields in logs.

`space.getMessage(...)` is a provider read outside the send pipeline and can throw `UnsupportedError` where message lookup is not implemented.

Official source: <https://photon.codes/docs/spectrum-ts/providers/imessage/messaging-features/message-metadata>
