# Spectrum composing and streaming

## Variadic content

```ts
await space.send(
  "Here is the file:",
  attachment("./document.pdf"),
);
```

Variadic sends call the provider once per item and create separate messages. Use `group(...)` only when the items should form one logical visual unit.

`message.reply(...)` is also variadic and wraps every item in a reply to the same target. On unsupported thread providers it no-ops rather than falling back.

## Streaming text

```ts
import { text, markdown } from "spectrum-ts";

await space.send(text(aiResult));
await space.send(markdown(customStream, {
  extract: (chunk) => chunk.delta?.text ?? null,
}));
```

Sources can be an AI SDK result, AsyncIterable, ReadableStream, or custom extracted stream. Spectrum auto-detects common Vercel AI SDK, OpenAI, and Anthropic chunk shapes.

A stream is single-consumption. Do not reuse one builder or source for multiple sends. Unsupported streaming providers drain it and send one accumulated message.

Official sources: <https://photon.codes/docs/spectrum-ts/content/composing-content> and <https://photon.codes/docs/spectrum-ts/content/text>
