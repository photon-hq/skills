# Getting started

> TypeScript samples below — primitives and the app instance are language-neutral.

## Installation

The umbrella package includes the standard provider set:

```bash
npm install spectrum-ts        # or pnpm / yarn / bun add
```

Requires TypeScript 5 or later.

For a lean install, add the core package and only the providers the application uses:

```bash
npm install @spectrum-ts/core @spectrum-ts/imessage @spectrum-ts/telegram
```

Compatibility imports such as `spectrum-ts/providers/imessage` work when the matching provider package is installed. Local macOS iMessage is intentionally separate:

```bash
npm install spectrum-ts @spectrum-ts/imessage-local
```

There is no `spectrum-ts/providers/imessage-local` compatibility path.

## Core concepts

| Primitive | What it represents |
|---|---|
| **Message** | An incoming or outgoing piece of content — text, attachments, actions, or structured data — from any platform. |
| **Space** | A conversation context. A DM, a group chat, or a terminal session. You send messages *into* a space. |
| **User** | A participant on a platform, identified by a platform-specific ID. |
| **Platform provider** | A platform adapter that translates provider-specific protocols into Spectrum's unified interface. |

Every incoming message arrives as a `[Space, Message]` pair.

## Credentials and environment variables

For Spectrum Cloud providers, pass `projectId` and `projectSecret` explicitly or set:

```text
SPECTRUM_PROJECT_ID
SPECTRUM_PROJECT_SECRET
```

Webhook consumers can similarly use `SPECTRUM_WEBHOOK_SECRET`. Explicit values win over environment variables. Provider configuration follows `SPECTRUM_<PLATFORM>_<FIELD>`, such as `SPECTRUM_TELEGRAM_BOT_TOKEN` and `SPECTRUM_WHATSAPP_BUSINESS_PHONE_NUMBER_ID`.

Keep project secrets in an ignored environment file or secret manager. Never put them in browser code, prompts, logs, or committed files.

## Quickstart

```ts
import { Spectrum } from "spectrum-ts";
import { imessage } from "spectrum-ts/providers/imessage";

const app = await Spectrum({
  providers: [imessage.config()],
});

try {
  for await (const [space, message] of app.messages) {
    if (message.direction === "outbound") continue;
    if (message.content.type !== "text") continue;

    // Use the platform's native vocabulary instead of treating chat like a webhook.
    await message.react("👍");
    await space.responding(async () => {
      await message.reply(`echo: ${message.content.text}`);
    });
  }
} finally {
  await app.stop();
}
```

> **Building an agent? Be rich, not robotic.** A bare `space.send(...)` works, but on iMessage and other rich platforms it can read like a webhook instead of a person. Reach for native features when they fit:
>
> - **`message.react("❤️" | "👍" | "😂" | …)`** — acknowledge a message before the full response is ready.
> - **`message.reply(...)`** — answer the specific message in-thread.
> - **`space.responding(async () => { … })`** — show a typing indicator while slow work runs.
>
> These calls follow Spectrum's [capability and fallback semantics](./capability-semantics.md). Check the selected provider before depending on a richer interaction.

The loop above is the **reactive** path. To reach out first, resolve a user, create a space, and send into it; see [Reaching out vs replying](./spaces-and-users.md#reaching-out-vs-replying). Creating a conversation is a transport operation, not permission to cold-contact someone.

Projectless providers such as Terminal work without project credentials:

```ts
import { Spectrum } from "spectrum-ts";
import { terminal } from "spectrum-ts/providers/terminal";

const app = await Spectrum({ providers: [terminal.config()] });
```

## The app instance

```ts
app.messages                       // AsyncIterable<[Space, Message]>
await app.send(space, ...items)    // send into a space
await app.responding(space, fn)    // run fn with a typing indicator
await app.webhook(request, handler) // adapt a supported webhook request
await app.stop()                   // graceful shutdown
```

See [`custom-events-and-lifecycle.md`](./custom-events-and-lifecycle.md) for provider event streams, signal handling, and shutdown. See [`webhooks.md`](./webhooks.md) before using the request adapter.

## Multi-platform

Combine providers and Spectrum merges every source into `app.messages`. The `message.platform` field identifies the origin.

```ts
import { Spectrum } from "spectrum-ts";
import { imessage } from "spectrum-ts/providers/imessage";
import { terminal } from "spectrum-ts/providers/terminal";
import { whatsappBusiness } from "spectrum-ts/providers/whatsapp-business";

const app = await Spectrum({
  providers: [
    imessage.config(),
    whatsappBusiness.config({
      accessToken: process.env.WA_TOKEN!,
      phoneNumberId: process.env.WA_NUMBER_ID!,
      appSecret: process.env.WA_SECRET!,
    }),
    terminal.config(),
  ],
});

for await (const [space, message] of app.messages) {
  if (message.direction === "outbound") continue;
  await space.responding(async () => {
    await message.reply("Hello from Spectrum.");
  });
}
```

Provider-specific environment variables can replace explicit configuration fields where the provider documents that behavior.

## Logging and telemetry

```ts
const app = await Spectrum({
  providers: [imessage.config()],
  options: { logLevel: "debug" },
  telemetry: true,
});
```

`options.logLevel` overrides `LOG_LEVEL`. Spectrum redacts known secret and token fields from its own logs, but application logs still need the same discipline. Telemetry uses OpenTelemetry; standard `OTEL_EXPORTER_OTLP_*` variables override the default exporter. `app.stop()` flushes pending telemetry before shutdown.

## See also

- [Spectrum getting started](https://photon.codes/docs/spectrum-ts/getting-started)
- [`messages.md`](./messages.md) for the incoming message contract
- [`content.md`](./content.md) for outgoing content builders
- [`spaces-and-users.md`](./spaces-and-users.md) for proactive and reactive conversation flows
- [`providers/imessage.md`](./providers/imessage.md) for cloud and local iMessage constraints
