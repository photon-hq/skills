# WhatsApp Business provider

> TypeScript samples below — the 1:1-only constraint and customer-service window are platform features.

```ts
import { whatsappBusiness } from "spectrum-ts/providers/whatsapp-business";
```

Wraps the official WhatsApp Business Cloud API behind Spectrum's unified `Space`, `User`, `Message`, and content interfaces. Reactions and threaded replies map to native WhatsApp behavior. **1:1 only** — group creation throws.

Most multi-platform applications should use this provider. Load the separate `whatsapp-business` skill only when the application needs direct Meta features that Spectrum does not expose, such as approved templates, Flows, product lists, or lower-level interactive messages.

## Config

Pass the Meta credentials directly:

```ts
whatsappBusiness.config({
  accessToken: process.env.WA_TOKEN!,
  phoneNumberId: process.env.WA_NUMBER_ID!,
  appSecret: process.env.WA_SECRET!,
});
```

Or use the Spectrum environment fallbacks:

```text
SPECTRUM_WHATSAPP_BUSINESS_ACCESS_TOKEN
SPECTRUM_WHATSAPP_BUSINESS_PHONE_NUMBER_ID
SPECTRUM_WHATSAPP_BUSINESS_APP_SECRET
```

Find the direct values in the WhatsApp Business app settings on [Meta for Developers](https://developers.facebook.com/). Keep the access token and app secret in a secret manager; never log or commit them.

When the required direct credentials are present, an empty `whatsappBusiness.config()` can resolve them from the environment. A partial direct credential set is not enough to initialize direct mode; inspect the current provider error instead of guessing which path was selected.

Project-managed cloud configuration can discover lines attached after startup at its next credential refresh. Restart when a newly added line must be available immediately.

## Starting a conversation

Resolve a user by their WhatsApp phone number in international digits without the leading `+`:

```ts
const wa = whatsappBusiness(app);
const customer = await wa.user("15551234567");
const space = await wa.space.create(customer);

await space.send("Thanks for reaching out.");
```

Do not reuse an iMessage E.164 string with the `+` unchanged. Platform identifiers are provider-specific.

A multi-user form such as `wa.space.create([userA, userB])` is unsupported because the WhatsApp Business provider is 1:1-only.

## Conversations and content

Use Spectrum's generic operations where the provider supports them:

```ts
await space.send("Your order is ready.");
await message.reply("I can help with that.");
await message.react("👍");
await message.read();
```

Text, attachments, contacts, provider-supported location/custom content, replies, reactions, and read actions map to WhatsApp Business behavior. Read [`../capability-semantics.md`](../capability-semantics.md) before treating every universal action as guaranteed.

## Customer-service window

Free-form outbound messaging remains subject to Meta's customer-service window. Do not treat a successfully resolved `Space` as permission to send unrestricted free-form content.

When the window is closed, use an approved template through the low-level `@photon-ai/whatsapp-business` SDK or redesign the flow around an inbound user message. Do not retry a policy rejection as though it were a transient network failure.

## See also

- [WhatsApp Business setup](https://photon.codes/docs/spectrum-ts/providers/whatsapp-business/setup)
- [WhatsApp Business conversations](https://photon.codes/docs/spectrum-ts/providers/whatsapp-business/conversations)
- [`../spaces-and-users.md`](../spaces-and-users.md) for the generic conversation model
- [`../capability-semantics.md`](../capability-semantics.md) for optional operation outcomes
- The repository's `whatsapp-business` skill for templates, Flows, products, media, and direct Meta APIs
