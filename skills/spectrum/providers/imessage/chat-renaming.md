# iMessage chat renaming

```ts
import { rename } from "spectrum-ts";

await space.rename("Book Club");
await space.send(rename("Book Club"));
```

The builder rejects an empty name. Rename requires cloud `@spectrum-ts/imessage` and a group chat. Local mode and direct messages throw `UnsupportedError`.

Rename is fire-and-forget and resolves to `undefined`. The agent's own rename action is suppressed from the inbound stream, so do not wait for an echo event before continuing.

When another participant renames the group, the change arrives as `content.type === "rename"` with the new `displayName`. `message.sender` identifies the actor when Apple recorded one and can otherwise be `undefined`.

Official source: <https://photon.codes/docs/spectrum-ts/providers/imessage/messaging-features/chat-renaming>
