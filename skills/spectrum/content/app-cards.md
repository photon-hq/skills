# Spectrum app cards

Use `app()` for a tappable URL card instead of an inline link.

```ts
import { app } from "spectrum-ts";

const card = await space.send(app("https://example.com/order/123", {
  live: true,
}));
```

On iMessage, the recipient gets a native iMessage App card. Slack, Telegram, WhatsApp, and Terminal use their normal URL behavior. `live: true` is a rendering hint and requires a compatible platform and installed extension.

## Update an iMessage card in place

```ts
import { app, edit } from "spectrum-ts";

const card = await space.send(app("https://example.com/status/pending"));
await space.send(edit(app("https://example.com/status/complete"), card));
```

Keep the original returned message for later updates. The edit returns `undefined`. In-place card updates require `@spectrum-ts/imessage`; they do not work through `@spectrum-ts/imessage-local` or URL fallbacks.

The provider stores `miniAppCardSession` metadata on successful iMessage app sends. Treat it as provider-managed and preserve the returned message object rather than reconstructing it.

Official source: <https://photon.codes/docs/spectrum-ts/content/app>
