# iMessage group avatars

```ts
import { avatar } from "spectrum-ts";

await space.avatar("./icon.png");
await space.avatar(buffer, { mimeType: "image/jpeg" });
await space.avatar("clear");
await space.send(avatar("./icon.png"));
```

Read the current icon:

```ts
const icon = await space.getAvatar();
if (icon) await otherGroup.avatar(icon.data, { mimeType: icon.mimeType });
```

Avatar reads and writes require cloud `@spectrum-ts/imessage` and a group chat. Local mode and DMs throw `UnsupportedError`. `getAvatar()` returns `undefined` when no icon exists.

Inbound set events carry image bytes behind `action.read()` during streaming mode; over serialized webhooks, fetch the current state using `space.getAvatar()`.

Official source: <https://photon.codes/docs/spectrum-ts/providers/imessage/messaging-features/group-avatars>
