# Native iMessage contact-card sharing

Use this for the bot account's own native iMessage contact card. Use generic `contact()` when sharing arbitrary structured contact data for another person or organization.

```ts
import { nativeContactCard, imessage } from "spectrum-ts/providers/imessage";

await space.send(nativeContactCard());

const im = imessage(space);
await im.shareContactCard();
```

This is useful during onboarding so recipients can save the bot line and recognize later messages. The card is generated from the iMessage account and profile behind the line; this API does not accept arbitrary vCard fields.

Native contact-card sharing requires cloud `@spectrum-ts/imessage`. Local mode throws `UnsupportedError`. The operation is a native iMessage action rather than a cross-platform contact builder.

Official source: <https://photon.codes/docs/spectrum-ts/providers/imessage/messaging-features/contact-card-sharing>
