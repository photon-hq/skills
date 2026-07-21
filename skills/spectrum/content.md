# Content builders

> TypeScript samples below — builder names and content shapes are language-neutral.

Every `send` / `reply` accepts a plain string or a content builder. Common message-body builders are `text`, `markdown`, `attachment`, `voice`, `contact`, `richlink`, `app`, `poll`, `option`, `group`, and `custom`; provider-specific and action builders are covered in their topic files.

## Text

```ts
import { text } from "spectrum-ts";

await space.send(text("Hello, world."));
await space.send("Hello, world."); // strings are equivalent
```

## Markdown and streaming text

Use `markdown()` for styled outbound text. Both `text()` and `markdown()` also accept an AI SDK result, `AsyncIterable`, or `ReadableStream`; providers with streaming support update progressively, while others wait and send the accumulated text.

```ts
import { markdown } from "spectrum-ts";

await space.send(markdown("**Bold** and _italic_ text."));
```

Inbound formatted messages still arrive as `text` content.

## Attachments

Pass a filesystem path, `URL`, or `Buffer`. MIME types are inferred from path and URL extensions; provide `options.mimeType` for raw bytes or when the extension is missing. If MIME cannot be inferred and no override is present, the builder throws at build time.

```ts
import { attachment } from "spectrum-ts";

await space.send(attachment("/path/to/photo.jpg"));
await space.send(attachment(new URL("https://example.com/photo.jpg")));
await space.send(attachment(buffer, { name: "report.pdf", mimeType: "application/pdf" }));
```

## Voice

Same input shape as `attachment`, plus optional `duration` for waveform UIs. Platforms without voice support downgrade to a regular audio attachment.

```ts
import { voice } from "spectrum-ts";

await space.send(voice("/path/to/note.m4a"));
await space.send(voice(buffer, { name: "note.m4a", mimeType: "audio/mp4", duration: 12 }));
```

## Contacts

Accepts a structured `ContactInput`, a vCard string, a `vcf` instance, or a `User` plus optional details.

```ts
import { readFile } from "node:fs/promises";
import { contact } from "spectrum-ts";

await space.send(contact({
  name: { first: "Ada", last: "Lovelace" },
  phones: [{ value: "+15551234567", type: "mobile" }],
}));

await space.send(contact(alice, { org: { name: "Acme", title: "Engineer" } }));

const vcf = await readFile("/path/to/ada.vcf", "utf8");
await space.send(contact(vcf));
```

`fromVCard` parses; `toVCard` serializes a resolved `Contact` back. `ContactInput` fields: `name`, `phones`, `emails`, `addresses`, `org`, `urls`, `birthday`, `note`, `photo`, `raw`.

## Rich links

`richlink()` carries only the URL; Spectrum does not fetch Open Graph metadata. Each provider asks its native client to render or unfurl the URL, and platforms without rich-link support fall back to plain text.

```ts
import { richlink } from "spectrum-ts";

await space.send(richlink("https://example.com/article"));
```

## App cards

Use `app()` for a tappable app-style URL card. `live` requests a provider's live app UI when available; providers without an app-card surface fall back to their normal URL behavior.

```ts
import { app } from "spectrum-ts";

await space.send(app("https://example.com/dashboard", { live: true }));
```

## Polls

```ts
import { poll, option } from "spectrum-ts";

await space.send(poll("Lunch?", "Pizza", "Sushi", "Tacos"));
await space.send(poll("Lunch?", [option("Pizza"), option("Sushi")]));
```

Poll responses arrive as `poll_option` content.

## Groups

`group()` bundles multiple messages into one logical unit (album, multi-attachment reply). Each item is delivered as its own `Message` but ships together. Groups don't nest, and reactions can't be group members — both enforced at construction. Platforms without grouping fall back to sending each item sequentially.

```ts
import { group, attachment } from "spectrum-ts";

await space.send(group(
  attachment("/path/to/photo-1.jpg"),
  attachment("/path/to/photo-2.jpg"),
));
```

## Custom

Send platform-specific structured payloads. The provider's top-level `send` dispatcher interprets `raw`.

```ts
import { custom } from "spectrum-ts";

await space.send(custom({ type: "card", title: "Order Confirmed" }));
```

## Composing multiple items

```ts
await space.send("Here's the file:", attachment("/path/to/document.pdf"));
```

Items send as separate messages (one `send()` per item). Use `group(...)` for a single bundled unit.
