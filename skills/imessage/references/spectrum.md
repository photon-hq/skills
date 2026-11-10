# Spectrum iMessage

Read this reference for the unified `spectrum-ts` API. If the separate [`spectrum` skill](../../spectrum/SKILL.md) is installed, use its topic files for the full core and provider contract; this page keeps the iMessage package boundary usable when the `imessage` skill is installed alone.

Spectrum Cloud and local macOS iMessage are separate providers, not configuration modes:

| Runtime | Provider | Platform ID |
|---|---|---|
| Spectrum Cloud | `imessage` from `spectrum-ts/providers/imessage` | `"imessage"` |
| A Mac you control | `localIMessage` from `@spectrum-ts/imessage-local` | `"local_imessage"` |

## Cloud quickstart

```ts
import { Spectrum } from "spectrum-ts";
import { imessage } from "spectrum-ts/providers/imessage";

const app = await Spectrum({
  projectId: process.env.SPECTRUM_PROJECT_ID!,
  projectSecret: process.env.SPECTRUM_PROJECT_SECRET!,
  providers: [imessage.config()],
});

try {
  for await (const [space, message] of app.messages) {
    if (message.direction === "outbound") continue;
    if (message.content.type !== "text") continue;

    await message.react("👍");
    await message.reply(`echo: ${message.content.text}`);
  }
} finally {
  await app.stop();
}
```

Use `providers:`, not the removed `platforms:` option. Reactions take emoji glyphs; there are no `imessage.tapbacks.*` constants.

## Local provider

```bash
bun add spectrum-ts @spectrum-ts/imessage-local
```

```ts
import { Spectrum } from "spectrum-ts";
import { localIMessage } from "@spectrum-ts/imessage-local";

const app = await Spectrum({
  providers: [localIMessage.config()],
});
```

The local provider receives and sends text, attachments, and universal contact content. Universal app content degrades to its URL, while typing is accepted as a no-op. Polls, effects, and other unsupported content types are skipped or rejected according to Spectrum's current capability semantics. Reactions, replies, edits, unsend, read receipts, streaming text, backgrounds, rename, avatars, native contact-card sharing, and membership writes are unavailable.

Within local space creation, `space.create(user)` returns a deterministic 1:1 DM reference. Both `space.create([])` and a multi-user form such as `space.create([a, b])` throw. Resolve an existing group with `space.get(chatGuid)`.

## Spaces and proactive outreach

The platform object exposes a namespace, not a callable `space()`:

```ts
const im = imessage(app);
const alice = await im.user("+15551111111");

const dm = await im.space.create(alice);
const existing = await im.space.get("any;-;+15551111111", {
  phone: "+15559999999",
});
await dm.send("Your requested reminder is ready.");
await existing.send("Hello again.");
```

`space.create` is a transport path, not permission to cold-contact. For cloud iMessage:

- Free and Pro shared-pool recipients must first be registered as project users, or sending fails with `Target not allowed for this project`.
- The defaults are 50 new conversations per line per day and 5,000 messages per server per day.
- Group creation requires a dedicated Business line.
- With multiple dedicated clients, `space.get(id, { phone })` requires the serving line; shared mode and a single dedicated client do not.

## Effects and tapbacks

Wrap text, Markdown, or an attachment with `effect()`. Use named constants so Lasers and Celebration cannot be confused:

```ts
import { effect, imessage } from "spectrum-ts/providers/imessage";

await space.send(effect("Happy birthday!", imessage.effect.message.lasers));
await message.react("❤️");
```

Native tapback glyphs are `❤️`, `👍`, `👎`, `😂`, `‼️`, and `❓`. Any other emoji becomes a custom-emoji reaction. `imessage.effect.message.lasers` is `CKLasersEffect`; `imessage.effect.message.celebration` is `CKHappyBirthdayEffect`.

## Capability check

Read [`../../spectrum/capability-semantics.md`](../../spectrum/capability-semantics.md) before treating a resolved promise as proof that an optional operation was rendered. Depending on the provider and content type, the result can be native support, a fallback, warn-and-skip, an accepted no-op, or a thrown resolver error.

## Sources

- [Spectrum getting started](https://photon.codes/docs/spectrum-ts/getting-started)
- [iMessage connection and routing](https://photon.codes/docs/spectrum-ts/providers/imessage/connection-and-routing)
- [iMessage messaging features](https://photon.codes/docs/spectrum-ts/providers/imessage/messaging-features)
- [iMessage troubleshooting](https://photon.codes/docs/spectrum-ts/troubleshooting/imessage)
