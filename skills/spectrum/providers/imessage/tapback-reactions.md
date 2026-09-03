# iMessage tapback reactions

```ts
import { Emoji } from "spectrum-ts";

await message.react(Emoji.laugh);
```

Six universal aliases map to native tapbacks:

- `Emoji.love`
- `Emoji.like`
- `Emoji.dislike`
- `Emoji.laugh`
- `Emoji.emphasize`
- `Emoji.question`

Other emoji use ordinary emoji reactions where supported. Cloud iMessage is required for reactions. Keep the returned reaction Message if you may need to unsend it.

Official source: <https://photon.codes/docs/spectrum-ts/providers/imessage/messaging-features/tapback-reactions>
