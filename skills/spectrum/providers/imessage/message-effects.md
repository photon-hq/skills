# iMessage message effects

Effects require cloud `@spectrum-ts/imessage`. Local mode rejects them with `UnsupportedError`. Other providers receive the wrapped content without the effect.

```ts
import { attachment } from "spectrum-ts";
import { effect, imessage } from "spectrum-ts/providers/imessage";

await space.send(effect("Happy birthday!", imessage.effect.message.celebration));
await space.send(effect(
  attachment("./photo.jpg"),
  imessage.effect.message.confetti,
));
```

`effect()` accepts a string, `text`, `markdown`, or `attachment`. Other content types fail when built.

Bubble effects:

- `slam`
- `loud`
- `gentle`
- `invisible`

Screen effects:

- `balloons`
- `celebration`
- `confetti`
- `echo`
- `fireworks`
- `heart`
- `lasers`
- `sparkles`
- `spotlight`

Official source: <https://photon.codes/docs/spectrum-ts/providers/imessage/messaging-features/message-effects>
