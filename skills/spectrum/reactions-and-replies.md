# Reactions and replies

> TypeScript samples below — warn-and-skip behavior on unsupported platforms is part of the model, not a TS detail.

Both `react` and `reply` live directly on an incoming message. When a platform does not support the operation, Spectrum logs a structured warning, skips it, and resolves without throwing — no `try/catch` needed.

```ts
await message.react("❤️");
await message.reply("Replying to your message.");
await message.reply("Here's the file:", attachment("/path/to/file.pdf"));
```

On platforms with thread support (iMessage, WhatsApp Business), `reply` sends threaded. **It is not downgraded to a regular send** — if you need guaranteed delivery, use `space.send(...)`.

`react` takes an emoji glyph. iMessage maps six glyphs to native tapbacks — `❤️` `👍` `👎` `😂` `‼️` `❓` — and sends any other emoji as a custom-emoji reaction. There are no `imessage.tapbacks.*` constants; see [`providers/imessage.md`](./providers/imessage.md).

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
