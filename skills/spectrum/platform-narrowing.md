# Platform narrowing

> TypeScript samples below — narrowing is the conceptual pattern across SDKs; the TS implementation uses callable provider objects with TS type narrowing.

Every provider exports a callable — including `imessage`, `localIMessage`, `slack`, `terminal`, `whatsappBusiness`, and `telegram` — that **narrows** generic Spectrum types into platform-specific ones. The same function handles three inputs:

```ts
import { imessage } from "spectrum-ts/providers/imessage";

// 1. Narrow the app — get user/space resolvers and custom events
const im = imessage(app);
const user = await im.user("+15551234567");
const space = await im.space.create(user);

// 2. Narrow a space — access platform-specific fields
for await (const [space, message] of app.messages) {
  if (message.platform !== "imessage") continue;
  const imSpace = imessage(space);
  if (imSpace.type === "group") { /* ... */ }
}

// 3. Narrow a message — exposes provider's `message.schema` extras
const imMessage = imessage(message);
```

If the platform isn't registered in `providers`, `imessage(app)` resolves to `never` (compile-time error in TS). Narrowing a space or message from the wrong platform logs a structured warning at runtime, so gate on `message.platform` first.

Platform IDs are stable lowercase identifiers. Cloud iMessage uses `"imessage"`; the separate macOS provider uses `"local_imessage"` and narrows with `localIMessage(...)`.

The generic `Space` and `Message` interfaces are deliberately small — just enough to send, react, and reply across every platform. Narrowing is the escape hatch for everything else: typed access to iMessage chat types, WhatsApp phone numbers, or any extra field your [custom platform](./custom-platforms.md) exposes.
