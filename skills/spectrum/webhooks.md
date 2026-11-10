# Spectrum SDK webhooks

This file owns the SDK-side HTTP interface. Registration, signing-secret lifecycle, delivery retries, and secret recovery belong to [`../photon-webhooks/SKILL.md`](../photon-webhooks/SKILL.md).

Configure the native Spectrum signing secret on the app:

```ts
const app = await Spectrum({
  projectId: process.env.SPECTRUM_PROJECT_ID!,
  projectSecret: process.env.SPECTRUM_PROJECT_SECRET!,
  providers: [imessage.config()],
  webhookSecret: process.env.SPECTRUM_WEBHOOK_SECRET,
});
```

Call `app.webhook(request, handler)` from the HTTP `POST` route:

```ts
server.post("/spectrum/webhook", (context) =>
  app.webhook(context.req.raw, async (space, message) => {
    if (message.content.type === "text") {
      await space.send(`echo: ${message.content.text}`);
    }
  }),
);
```

Express must use the raw body overload and mount webhook middleware before a global JSON parser. First-party adapters exist for Hono, Express, and Elysia.

## What the SDK handles

- Native HMAC verification over the exact raw body and five-minute replay window.
- Native JSON versus Fusor protobuf format detection.
- Deserialization into normal Spectrum `Space` and `Message` objects.
- Lazy attachment rehydration where the event contains metadata only.
- Immediate HTTP response while the message handler runs fire-and-forget.

`app.webhook()` is request-scoped. It does not feed `app.messages` and does not open the streaming connection. Both webhook formats are at-least-once, so deduplicate exactly-once side effects on `message.id`.

Official source: <https://photon.codes/docs/spectrum-ts/webhooks>
