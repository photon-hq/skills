# iMessage provider

> TypeScript samples below — provider selection, line model, effects, and tapbacks are platform features that apply across all Spectrum SDKs.
>
> Tested with `spectrum-ts` 12.2.0 and `@photon-ai/imessage-kit` 3.0.0 (the local provider's engine).

```ts
import { imessage } from "spectrum-ts/providers/imessage";
```

Cloud and local iMessage are separate platforms selected by provider import, not config modes. Use `imessage` through `spectrum-ts/providers/imessage` (backed by `@spectrum-ts/imessage`) for Spectrum Cloud and `localIMessage` from `@spectrum-ts/imessage-local` for a Mac you control. iMessage-specific fields come through [platform narrowing](../platform-narrowing.md).

## Cloud provider

```ts
// Managed cloud; group features require a dedicated line.
// Tokens auto-renew at 80% of TTL. Requires projectId/projectSecret on Spectrum().
imessage.config();

// Advanced routing — subscribe to an explicit subset of the project's
// cloud-owned lines. Explicit tokens are not auto-renewed.
imessage.config({
  clients: [
    { address: "instance-1.example.com:443", token: "your-token", phone: "+15551111111" },
    { address: "instance-2.example.com:443", token: "your-token", phone: "+15552222222" },
  ],
});
```

Explicit `clients` still use the cloud provider; they are not a separate dedicated connection mode. Use them only when this SDK instance should subscribe to specific cloud lines, and keep their tokens current yourself. Shared versus dedicated is the line allocation attached to the project plan, described below.

## Local provider

Reading the local macOS Messages database requires the separate `@spectrum-ts/imessage-local` package. It talks to the Messages SQLite store directly and supports receiving and sending text, attachments, and universal contact content. Universal app content degrades to its URL. Reactions, threaded replies, edits, unsend, read receipts, effects, group creation, streaming text, native sharing of the agent's own contact card, and membership or group-metadata operations are unavailable; typing signals are accepted as no-ops.

```bash
bun add spectrum-ts @spectrum-ts/imessage-local
```

```ts
import { Spectrum } from "spectrum-ts";
import { localIMessage } from "@spectrum-ts/imessage-local";

const app = await Spectrum({ providers: [localIMessage.config()] });
```

Local messages use `"local_imessage"` in `message.platform`; cloud messages use `"imessage"`. `space.create(user)` creates a deterministic 1:1 DM reference locally. Group creation (`space.create([a, b])`) throws because the local database cannot create chats; use `space.get(chatGuid)` for an existing group.

## Line model (cloud provider)

| Plan | Line allocation | What end users see |
|---|---|---|
| **Free / Pro** | Shared pool — each end user is routed through a number from the pool | Normal iMessage from a number that may differ across recipients |
| **Business** | Dedicated — all end users text the same number, which belongs to your project | Normal iMessage, always from the same number |

**Auto-scale** is an opt-in Business feature: when traffic to a dedicated line nears its per-line capacity, Spectrum provisions an additional line. Managed-line concepts do not apply to `@spectrum-ts/imessage-local`, where you provide the Messages account on the Mac.

## Quotas

Default cloud quotas are 5,000 messages per server per day and 50 new conversations per line per day. The second limit counts the first message to a recipient that line has never contacted; replies in existing conversations do not count. On Free and Pro shared-pool plans, recipients must be registered as project users in the Photon Dashboard before outreach; otherwise sending fails with `Target not allowed for this project`. Dedicated Business lines are exempt from that allowlist. Contact `help@photon.codes` for an increase.

## Space types and per-phone routing

iMessage spaces carry `type: "dm" | "group"` and a `phone` field. With multiple dedicated lines, pin a conversation to a specific line:

```ts
const dm = await im.space.create(alice, { phone: "+15559999999" });
const existing = await im.space.get("any;-;+15551111111", {
  phone: "+15559999999",
});
```

For `space.create`, omitting `phone` makes Spectrum pick at random from available dedicated lines. For `space.get`, `phone` is optional in shared mode or with one dedicated client but required when multiple dedicated clients are configured, including auto-scaled lines. Per-phone routing applies to **dedicated lines (Business plan) only**; on shared-pool plans the parameter is ignored. `space.create(user)` opens a 1:1 DM with either provider; group creation (`space.create([a, b])`) works on **dedicated cloud lines only** — the shared-pool cloud provider and local provider both reject groups.

## Message effects

Wrap text, `markdown(...)`, or `attachment(...)` with `effect()`. Effects only apply on iMessage; other platforms see the inner content unchanged.

```ts
import { attachment } from "spectrum-ts";
import { effect, imessage } from "spectrum-ts/providers/imessage";

await space.send(effect("Happy birthday!", imessage.effect.message.celebration));
await space.send(effect(attachment("/path/to/photo.jpg"), imessage.effect.message.confetti));
```

| Bubble effects | |
|---|---|
| `imessage.effect.message.slam` | `"com.apple.MobileSMS.expressivesend.impact"` |
| `imessage.effect.message.loud` | `"com.apple.MobileSMS.expressivesend.loud"` |
| `imessage.effect.message.gentle` | `"com.apple.MobileSMS.expressivesend.gentle"` |
| `imessage.effect.message.invisible` | `"com.apple.MobileSMS.expressivesend.invisibleink"` |

| Screen effects | |
|---|---|
| `imessage.effect.message.confetti` | `"com.apple.messages.effect.CKConfettiEffect"` |
| `imessage.effect.message.fireworks` | `"com.apple.messages.effect.CKFireworksEffect"` |
| `imessage.effect.message.balloons` | `"com.apple.messages.effect.CKBalloonEffect"` |
| `imessage.effect.message.heart` | `"com.apple.messages.effect.CKHeartEffect"` |
| `imessage.effect.message.lasers` | `"com.apple.messages.effect.CKLasersEffect"` |
| `imessage.effect.message.celebration` | `"com.apple.messages.effect.CKHappyBirthdayEffect"` |
| `imessage.effect.message.sparkles` | `"com.apple.messages.effect.CKSparklesEffect"` |
| `imessage.effect.message.spotlight` | `"com.apple.messages.effect.CKSpotlightEffect"` |
| `imessage.effect.message.echo` | `"com.apple.messages.effect.CKEchoEffect"` |

## Tapbacks

React with an emoji glyph — `message.react(glyph)`. iMessage maps these six glyphs to native tapbacks; any other emoji is sent as a custom-emoji reaction. There are **no** `imessage.tapbacks.*` constants. Pass a literal glyph or use Spectrum's universal `Emoji` aliases.

| Tapback | Glyph |
|---|---|
| Love | `"❤️"` |
| Like | `"👍"` |
| Dislike | `"👎"` |
| Laugh | `"😂"` |
| Emphasize | `"‼️"` |
| Question | `"❓"` |

```ts
import { Emoji } from "spectrum-ts";

await message.react("😂");
await message.react(Emoji.laugh);
```
