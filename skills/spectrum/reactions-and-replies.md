# Reactions and replies

> TypeScript samples below — provider support follows Spectrum's [capability and fallback semantics](./capability-semantics.md).

Both `react` and `reply` live directly on an incoming message. Read the selected provider before depending on either operation; the universal methods can resolve without producing a message.

```ts
await message.react("❤️");
await message.reply("Replying to your message.");
await message.reply("Here's the file:", attachment("/path/to/file.pdf"));
```

On platforms with thread support (iMessage, WhatsApp Business), `reply` sends threaded. **It is not downgraded to a regular send** — if you need guaranteed delivery, use `space.send(...)`.

`react` takes an emoji glyph. For iMessage's native tapback mapping, custom-emoji behavior, and aliases, read [`providers/imessage.md`](./providers/imessage.md#tapbacks).

Spectrum also exports semantic aliases when a named value reads better:

```ts
import { Emoji } from "spectrum-ts";

await message.react(Emoji.laugh); // "😂"
```

| Want to | Use |
|---|---|
| Send fresh content into a conversation | `space.send(...)` |
| Reply in-thread to a specific message | `message.reply(...)` |
| React to a specific message | `message.react("👍")` |
