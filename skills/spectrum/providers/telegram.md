# Spectrum Telegram provider

## Setup

```ts
import { telegram } from "spectrum-ts/providers/telegram";

telegram.config({
  botToken: process.env.TELEGRAM_BOT_TOKEN!,
  webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
});
```

Config fallbacks:

- `SPECTRUM_TELEGRAM_BOT_TOKEN`
- `SPECTRUM_TELEGRAM_WEBHOOK_SECRET`
- `SPECTRUM_TELEGRAM_BASE_URL`

In cloud mode, Spectrum registers the Fusor webhook automatically. In direct/local deployment, register the Telegram webhook yourself.

## Conversations

```ts
const tg = telegram(app);
const user = await tg.user("123456789");
const dm = await tg.space.create(user);
const existingGroup = await tg.space.get(process.env.TELEGRAM_CHAT_ID!);
```

Bots can start private conversations but cannot create groups. Numeric chat IDs must be stringified.

Supported features include text, Markdown rendered as Telegram HTML, streaming drafts in private chats, media, reactions, replies, typing, edits, and raw Bot API calls with `custom({ method, params })`.

Official sources: <https://photon.codes/docs/spectrum-ts/providers/telegram/setup> and <https://photon.codes/docs/spectrum-ts/providers/telegram/conversations-and-features>
