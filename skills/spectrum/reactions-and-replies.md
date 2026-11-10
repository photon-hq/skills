# Reactions and replies

> TypeScript samples below — provider support follows Spectrum's [capability and fallback semantics](./capability-semantics.md).

Reactions, replies, edits, and unsend are available as convenience methods on `Message` or `Space`, and as canonical content builders. They route through the same send pipeline, so a universal method existing does not prove that every provider performs the action.

## Reactions

React directly to a message or send `reaction()` content through the containing space:

```ts
import { Emoji, reaction } from "spectrum-ts";

const first = await message.react(Emoji.laugh);
const second = await space.send(reaction("❤️", message));
```

A supported reaction can return a `Message` handle that may later be unsent. Unsupported providers resolve without producing a message. Reactions cannot target another reaction message.

Spectrum exports semantic aliases when a named value reads better:

```ts
await message.react(Emoji.love);       // "❤️"
await message.react(Emoji.like);       // "👍"
await message.react(Emoji.dislike);    // "👎"
await message.react(Emoji.laugh);      // "😂"
await message.react(Emoji.emphasize);  // "‼️"
await message.react(Emoji.question);   // "❓"
```

For iMessage's native tapback mapping and custom-emoji behavior, read [`providers/imessage/tapback-reactions.md`](./providers/imessage/tapback-reactions.md).

## Replies

Reply directly to the incoming message or build reply content explicitly:

```ts
import { attachment, reply, text } from "spectrum-ts";

await message.reply("Got it");
await message.reply("Here's the file:", attachment("./answer.pdf"));
await space.send(reply(text("Got it"), message));
```

On platforms with native thread support, including iMessage and WhatsApp Business, `reply` sends in-thread. **It is not downgraded to a regular send.** When delivery is more important than threading, use `space.send(...)` instead.

`reply()` cannot wrap another reply or action content such as `edit`, `reaction`, `group`, `typing`, `rename`, `avatar`, membership, `leaveSpace`, `unsend`, or `read`.

## Edits

Edit an outbound message through its convenience method or the `edit()` builder:

```ts
import { edit, text } from "spectrum-ts";

const sent = await space.send("Draft");
await sent?.edit("Final version");
await space.send(edit(text("Another version"), sent));
```

Only outbound messages can be edited. An edit is fire-and-forget and resolves without a new message handle. Native edit windows and provider restrictions surface during the operation.

## Unsend

Retract an outbound message through the message, space, or builder form:

```ts
import { unsend } from "spectrum-ts";

const sent = await space.send("Oops");
await sent?.unsend();
await space.unsend(sent);
await space.send(unsend(sent));
```

Only outbound messages can be unsent. The builder rejects inbound targets. Native time windows, including iMessage's unsend window, still apply.

## Choosing the operation

| Want to | Use |
|---|---|
| Send fresh content into a conversation | `space.send(...)` |
| Reply in-thread to one message | `message.reply(...)` or `reply(...)` |
| React to one message | `message.react("👍")` or `reaction(...)` |
| Change an outbound message | `message.edit(...)`, `space.edit(...)`, or `edit(...)` |
| Retract an outbound message | `message.unsend()`, `space.unsend(...)`, or `unsend(...)` |

Read the selected provider before depending on any optional operation. A resolved promise may represent native support, a fallback, warn-and-skip behavior, or a documented no-op.

## See also

- [Spectrum reactions and replies documentation](https://photon.codes/docs/spectrum-ts/reactions-and-replies)
- [`capability-semantics.md`](./capability-semantics.md) for provider outcomes
- [`content/replies-edits-and-unsend.md`](./content/replies-edits-and-unsend.md) for the builder constraints
- [`providers/imessage/tapback-reactions.md`](./providers/imessage/tapback-reactions.md) for iMessage mappings
