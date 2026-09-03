# Platform narrowing

> TypeScript samples below — narrowing is the conceptual pattern across SDKs; the TypeScript implementation uses callable provider objects with static type narrowing.

Every provider exports a callable — including `imessage`, `localIMessage`, `slack`, `terminal`, `whatsappBusiness`, and `telegram` — that **narrows** generic Spectrum types into provider-specific ones. The same function handles three inputs:

```ts
import { imessage } from "spectrum-ts/providers/imessage";

// 1. Narrow the app — get user/space resolvers and custom events.
const im = imessage(app);
const user = await im.user("+15551234567");
const space = await im.space.create(user);

// 2. Narrow a space — access provider-specific fields.
for await (const [space, message] of app.messages) {
  if (message.platform !== "imessage") continue;

  const imSpace = imessage(space);
  if (imSpace.type === "group") {
    console.log(imSpace.phone);
  }
}

// 3. Narrow a message — expose the provider's message-schema extras.
const imMessage = imessage(message);
```

If the provider is not registered in `providers`, `imessage(app)` resolves to `never`, producing a compile-time error in TypeScript. Narrowing a space or message from the wrong provider logs a structured warning at runtime, so gate on `message.platform` first.

Platform IDs are stable lowercase identifiers. Cloud iMessage uses `"imessage"`; the separate macOS provider uses `"local_imessage"` and narrows with `localIMessage(...)`.

## Why narrow

The generic `Space`, `Message`, and `User` interfaces cover cross-platform behavior. Narrowing is the escape hatch for provider-specific fields and operations:

- iMessage chat type, serving phone, message metadata, and provider feature methods;
- WhatsApp Business identifiers and provider configuration;
- Telegram, Slack, or Terminal-specific message and space fields;
- custom event streams and extra actions exposed by a custom platform.

Use generic content and space methods by default. Narrow only when the requested behavior actually depends on one provider.

## App narrowing

Narrow the app when resolving users or spaces, reading a provider-specific event stream, or calling a provider action:

```ts
const im = imessage(app);
const alice = await im.user("+15551234567");
const dm = await im.space.create(alice);
await dm.send("Hello.");
```

User and space identifiers are provider-specific. Do not pass an iMessage E.164 number to a provider that expects a Slack, Telegram, or WhatsApp identifier.

## Space and message narrowing

Gate first, then narrow:

```ts
for await (const [space, message] of app.messages) {
  if (message.platform !== "imessage") continue;

  const imSpace = imessage(space);
  const imMessage = imessage(message);

  if (imSpace.type === "group") {
    console.log(imMessage.id, imSpace.phone);
  }
}
```

Do not use exception handling as the normal provider discriminator. `message.platform` is the stable universal branch key.

## Custom platforms

A provider created with `definePlatform("my_platform", ...)` returns the same callable shape. Its `user.schema`, `space.schema`, `message.schema`, custom events, actions, and static constants become available through narrowing.

See [`custom-platforms.md`](./custom-platforms.md) for the authoring contract.

## See also

- [Spectrum platform narrowing](https://photon.codes/docs/spectrum-ts/platform-narrowing)
- [`spaces-and-users.md`](./spaces-and-users.md) for user and space resolution
- [`messages.md`](./messages.md) for the universal platform and direction fields
- [`custom-platforms.md`](./custom-platforms.md) for provider-defined narrowing extras
