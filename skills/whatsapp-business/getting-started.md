# WhatsApp Business getting started

Most apps should use Spectrum. Use `@photon-ai/whatsapp-business` when the requested direct Meta behavior is not exposed by Spectrum.

## Requirements

- Node.js 18 or later, or Bun.
- `accessToken`, `phoneNumberId`, and `appSecret` from the selected WhatsApp Business setup.
- Either Spectrum Cloud guided configuration or a Meta app configured for WhatsApp Business.

Treat all three values as server-side configuration. `accessToken` and `appSecret` are credentials; `phoneNumberId` is sensitive account metadata. Redact them from logs, error reports, analytics, and user-visible output.

```bash
npm install @photon-ai/whatsapp-business
```

## Bring-your-own Meta app

Use a permanent System User token rather than the temporary token from API Setup. Required scopes are `whatsapp_business_messaging`, `whatsapp_business_management`, and `business_management`.

Under **WhatsApp → Configuration**, configure the webhook before subscribing to events:

- **Callback URL:** `https://whatsapp-business.spectrum.photon.codes/webhook`
- **Verify token:** any non-empty value; the shared Photon endpoint returns Meta's challenge during verification
- **Webhook field:** subscribe to `messages`

The Verify token is part of Meta's callback handshake and is separate from `accessToken`, `appSecret`, and the project's Spectrum credentials. Do not reuse a production secret as the Verify token.

The shared webhook endpoint is public and does not require a separate registration with Photon. Photon uses the credentials supplied to the SDK at runtime; keep those credentials in the application's server-side secret store.

## Client

```ts
import { createClient } from "@photon-ai/whatsapp-business";

const client = createClient({
  accessToken: process.env.WA_ACCESS_TOKEN!,
  phoneNumberId: process.env.WA_PHONE_NUMBER_ID!,
  appSecret: process.env.WA_APP_SECRET!,
  retry: true,
  timeout: 10_000,
});

try {
  await client.messages.send({
    to: "+15551234567",
    text: "Hello",
  });
} finally {
  await client.close();
}
```

The client exposes `messages`, `events`, and `media`. It also implements `Symbol.asyncDispose`, so `await using` is supported by compatible runtimes.

## Echo bot

```ts
let lastCursor: string | undefined;

for await (const event of client.events.subscribe({ cursor: lastCursor })) {
  if (event.type !== "message") continue;
  if (event.message.content.type !== "text") continue;

  await client.messages.send({
    to: event.message.from,
    text: event.message.content.body,
  });

  lastCursor = event.cursor;
  await persist(lastCursor);
}
```

Always narrow both `event.type` and `message.content.type`. Persist the event cursor only after every side effect for that event succeeds, so reconnect and missed-event recovery replay incomplete work instead of skipping it.

Before shipping:

- verify the Meta callback handshake;
- confirm the `messages` subscription is active;
- send one message to a test recipient who consented;
- receive one reply through `client.events.subscribe()`;
- confirm logs contain only stable IDs and operation metadata, not credentials or message content.

Official source: <https://photon.codes/docs/advanced-kits/whatsapp/getting-started>
