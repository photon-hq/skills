---
name: whatsapp-business
description: >
  Build or review integrations with `@photon-ai/whatsapp-business`, Photon's low-level WhatsApp Business SDK.
  Use when Spectrum does not expose the required Meta behavior: direct messages, media, locations, contacts,
  reactions, replies, read state, interactive buttons, lists, products, WhatsApp Flows, templates, the 24-hour
  customer-service window, resumable events, or typed errors.
license: MIT
metadata:
  author: photon-hq
  version: '1.0.0'
---

# WhatsApp Business

Most new multi-platform agents should start with Spectrum. Use `@photon-ai/whatsapp-business` directly when the application needs a low-level WhatsApp Business capability that Spectrum does not expose.

## Package boundary

Do not combine the low-level SDK with Spectrum provider methods in the same sample. The low-level client has its own constructor, message shapes, event stream, template builders, media lifecycle, and error types.

Before completing an implementation:

1. Confirm that the requested behavior is not already available through Spectrum.
2. Load the focused topic file for the operation.
3. Verify every method and content shape against the installed `@photon-ai/whatsapp-business` package.
4. Check the 24-hour customer-service window before sending free-form outbound content.
5. Keep access tokens, app secrets, phone-number IDs, media bytes, and contact data out of logs and committed files.

## Setup and quickstart

```bash
npm install @photon-ai/whatsapp-business
```

```typescript
import { createClient } from "@photon-ai/whatsapp-business";

const client = createClient({
  accessToken: process.env.WA_ACCESS_TOKEN!,
  phoneNumberId: process.env.WA_PHONE_NUMBER_ID!,
  appSecret: process.env.WA_APP_SECRET!,
});

try {
  await client.messages.send({
    to: "+15551234567",
    text: "Hello from Photon!",
  });

  for await (const event of client.events.subscribe()) {
    if (event.type === "message") console.log(event.message);
  }
} finally {
  await client.close();
}
```

The client exposes `messages`, `events`, and `media`. It also supports `Symbol.asyncDispose`, so `await using` is valid on runtimes that implement explicit resource management.

## How this skill is organized

Each topic lives in its own file in this directory. Read the file relevant to the user's question.

| File | When to consult |
|---|---|
| [`getting-started.md`](./getting-started.md) | Installation, credentials, client construction, cleanup, and the first send or event subscription. |
| [`messages.md`](./messages.md) | Text, media, locations, contacts, reactions, replies, read state, and the customer-service window. |
| [`interactive-messages.md`](./interactive-messages.md) | Reply buttons, lists, product messages, catalogs, and WhatsApp Flows. |
| [`templates.md`](./templates.md) | Approved templates, parameters, buttons, locale selection, and sending outside the 24-hour window. |
| [`events.md`](./events.md) | Resumable event subscriptions, cursors, message and status events, reconnects, and shutdown. |
| [`media.md`](./media.md) | Uploading, downloading, validating, and cleaning up media. |
| [`error-handling.md`](./error-handling.md) | Typed errors, Meta error payloads, retry decisions, rate limits, and invalid-recipient handling. |

## See also

- [Photon WhatsApp Business documentation](https://photon.codes/docs/advanced-kits/whatsapp/getting-started)
- The `spectrum` skill for unified WhatsApp Business and multi-platform agent logic
- The `photon-api` skill for project-level WhatsApp Business configuration over HTTPS
- The `photon-webhooks` skill for signed Spectrum event delivery to an HTTP backend
