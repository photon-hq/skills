# iMessage chat backgrounds

```ts
import { background, imessage } from "spectrum-ts/providers/imessage";

const im = imessage(space);
await im.background("./wallpaper.jpg");
await im.background(buffer, { mimeType: "image/jpeg" });
await im.background("clear");

await space.send(background("./wallpaper.jpg"));
```

Cloud mode waits until the asset is distributable, then iCloud distributes it. The method completing does not mean every recipient UI has rendered it. Distribution commonly takes tens of seconds and depends on network, iCloud, trust, and Messages state.

Backgrounds require cloud mode. Local mode throws `UnsupportedError`. The string `"clear"` is reserved.

Official source: <https://photon.codes/docs/spectrum-ts/providers/imessage/messaging-features/chat-backgrounds>
