# Messages

> TypeScript samples below — the `Message` shape and content variants are language-neutral.

Every provider feeds the same `app.messages` stream. Each item is a `[Space, Message]` pair; the space is already bound to the originating conversation, so do not resolve it again before replying.

```ts
for await (const [space, message] of app.messages) {
  if (message.direction === "outbound") continue;
  // Handle inbound content.
}
```

## The Message shape

Treat platform IDs as stable opaque values. A message includes:

| Field | Description |
|---|---|
| `id` | Platform-assigned message identifier. |
| `content` | Discriminated union on `type`; narrow before accessing variant fields. |
| `sender` | The acting `User`, or `undefined` when the platform recorded no actor. |
| `space` | The `Space` containing the message. |
| `platform` | Stable lowercase provider ID such as `"imessage"`, `"local_imessage"`, or `"terminal"`. |
| `direction` | `"inbound"` or `"outbound"`. Use this to filter echoed sends. |
| `timestamp` | `Date` when the message was created. |
| `react(emoji)` | React to this message where the provider supports it. |
| `reply(...content)` | Reply to this message in-thread where supported. |
| `read()` | Mark this inbound message and earlier messages in the conversation as read where supported. |
| `edit(content)` / `unsend()` | Edit or retract this message where supported and valid. |

Universal methods do not guarantee universal support. Read [`capability-semantics.md`](./capability-semantics.md) and the selected provider before depending on an optional operation.

## Narrowing content

`Content` is a discriminated union. Always switch on `message.content.type` before reading fields.

```ts
for await (const [space, message] of app.messages) {
  switch (message.content.type) {
    case "text":
      await message.reply(message.content.text);
      break;
    case "attachment":
      console.log(message.content.id, message.content.name, message.content.mimeType);
      break;
    case "read":
      console.log(message.sender?.id, message.content.target.id);
      break;
    case "addMember":
      console.log(message.sender?.id, message.content.members);
      break;
    case "custom":
      console.log(message.content.raw);
      break;
    default:
      // Stay forward-compatible with future content variants.
      break;
  }
}
```

Common content variants:

| Type | Important fields or meaning |
|---|---|
| `"text"` | `text` |
| `"markdown"` | Outbound styled text in `markdown` |
| `"attachment"` | `id`, `name`, `mimeType`, `size?`, `read()`, `stream()` |
| `"voice"` | `name?`, `mimeType`, `duration?`, `size?`, `read()`, `stream()` |
| `"contact"` | Name, phone, email, address, organization, URL, birthday, note, photo, user, and raw fields |
| `"richlink"` | `url` |
| `"app"` | Lazy `url()`, lazy `layout()`, and optional `live` metadata |
| `"effect"` | Wrapped content plus provider effect identifier |
| `"reaction"` | `emoji`, `target: Message` |
| `"reply"` | `content`, `target: Message` |
| `"edit"` | New `content`, existing `target: Message` |
| `"unsend"` | Existing outbound `target: Message` |
| `"read"` | `target: Message`; inbound read content means a user read a message the agent sent |
| `"typing"` | `state: "start" \| "stop"` |
| `"streamText"` | Single-consumption `stream()` and optional markdown format |
| `"poll"` | `title`, `options` |
| `"poll_option"` | `option`, `poll`, `selected`, `title` |
| `"group"` | `items: Message[]` |
| `"rename"` | `displayName` |
| `"avatar"` | Set or clear action; a set action may expose `read()` and `mimeType` |
| `"addMember"` / `"removeMember"` | `members: string[]`; `sender` is the actor when known |
| `"leaveSpace"` | No extra fields; `sender` is the member who left when known |
| `"custom"` | `raw: unknown` |

Outgoing-only variants may be echoed by a provider. Agent-originated membership, rename, avatar, and read actions can also be suppressed rather than echoed, depending on the provider contract.

## Filtering out your own messages

Every message has a universal `direction`; do not depend on an iMessage-only raw field or compare message text.

```ts
for await (const [space, message] of app.messages) {
  if (message.direction === "outbound") continue;
  // Handle user input.
}
```

When branching by provider, check the stable lowercase platform ID before narrowing:

```ts
import { imessage } from "spectrum-ts/providers/imessage";

for await (const [, message] of app.messages) {
  if (message.platform !== "imessage") continue;
  const imessageMessage = imessage(message);
  // Use iMessage-specific fields here.
}
```

Local iMessage uses `"local_imessage"`; cloud iMessage uses `"imessage"`. Do not treat them as one provider with a configuration flag.

## Message targets and actions

Replies, reactions, edits, unsend, and read content carry a target `Message`, not only a raw identifier. Only edit or unsend an outbound message. Provider-native time windows and permission checks surface during the send operation.

For the complete action contracts and builder equivalents, read [`reactions-and-replies.md`](./reactions-and-replies.md) and the focused files under [`content/`](./content/).

## See also

- [Spectrum messages documentation](https://photon.codes/docs/spectrum-ts/messages)
- [`content.md`](./content.md) for outgoing builders
- [`platform-narrowing.md`](./platform-narrowing.md) for provider-specific message fields
- [`capability-semantics.md`](./capability-semantics.md) for optional-operation outcomes
