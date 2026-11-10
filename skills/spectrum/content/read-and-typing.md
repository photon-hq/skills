# Spectrum read state and typing

## Mark read

```ts
import { read } from "spectrum-ts";
await space.send(read(message));
await message.read();
await space.read(message);
```

Only inbound messages can be marked read. The operation returns `undefined`.

Platform granularity differs:

- WhatsApp marks the target and all earlier messages read.
- Remote iMessage marks the whole chat read; local iMessage rejects it.
- Telegram and Slack silently no-op for bot conversations.

Inbound `content.type === "read"` means `message.sender` read `message.content.target`, which is a message the agent sent. Direct-message attribution is the reliable iMessage case; group receipts are best effort.

## Typing

```ts
import { typing } from "spectrum-ts";
await space.send(typing());
await space.send(typing("stop"));

await space.responding(async () => {
  await space.send(await generate());
});
```

Typing is best effort. Providers without a typing API silently no-op. Prefer `responding()` so stop-typing runs in a `finally` path.

Official sources: <https://photon.codes/docs/spectrum-ts/content/read> and <https://photon.codes/docs/spectrum-ts/content/typing-indicators>
