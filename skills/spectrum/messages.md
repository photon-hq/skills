# Messages

> TypeScript samples below — the `Message` shape and content variants are language-neutral.

Every message arrives through `app.messages` as a `[Space, Message]` pair. The space is already bound to the originating conversation, so you do not resolve it again to respond.

## The Message shape

| Field | Description |
|---|---|
| `id` | Platform-assigned message identifier. |
| `content` | Discriminated union on `type` — see [Narrowing content](#narrowing-content). |
| `sender` | The acting `User`, or `undefined` when the platform recorded no actor. |
| `space` | The `Space` containing the message. |
| `platform` | Stable lowercase provider ID, such as `"imessage"`, `"local_imessage"`, or `"terminal"`. |
| `direction` | `"inbound"` or `"outbound"`. Use this to filter echoed sends. |
| `timestamp` | `Date` when the message was created. |
| `react(emoji)` | React to this message. Unsupported providers normally warn and skip; see [capability semantics](./capability-semantics.md). |
| `reply(...content)` | Reply to this message in-thread. Unsupported providers normally warn and skip; see [capability semantics](./capability-semantics.md). |
| `read()` | Mark this inbound message and earlier messages in the conversation as read; provider support and granularity vary. |
| `edit(content)` / `unsend()` | Edit or retract this message where supported. |

## Narrowing content

`Content` is a discriminated union. Narrow on `message.content.type` before accessing variant fields. Membership events expose `members` as normalized platform ID strings (`string[]`); outbound membership builders also accept `User` objects but convert them to IDs before building content.

```ts
for await (const [space, message] of app.messages) {
  switch (message.content.type) {
    case "text":
      console.log(message.content.text);
      break;
    case "attachment":
      console.log(message.content.name, await message.content.read());
      break;
    case "reaction":
      console.log(`${message.content.emoji} on ${message.content.target.id}`);
      break;
    case "addMember":
      console.log(`${message.sender?.id ?? "someone"} added ${message.content.members.join(", ")}`);
      break;
    case "avatar":
      if (message.content.action.kind === "set") {
        console.log(await message.content.action.read());
      }
      break;
    case "custom":
      console.log(message.content.raw);
      break;
  }
}
```

Common content variants:

| Type | Important fields |
|---|---|
| `"text"` | `text` |
| `"markdown"` | `markdown` — outbound styled text |
| `"attachment"` | `id`, `name`, `mimeType`, `size?`, `read()`, `stream()` |
| `"voice"` | `name?`, `mimeType`, `duration?`, `size?`, `read()`, `stream()` |
| `"contact"` | `name?`, `phones?`, `emails?`, `addresses?`, `org?`, `urls?`, `birthday?`, `note?`, `photo?`, `user?`, `raw?` |
| `"richlink"` | `url` |
| `"app"` | `url()`, `layout()`, `live?` |
| `"effect"` | `content`, `effect` — iMessage effect around text, markdown, or an attachment |
| `"reaction"` | `emoji`, `target: Message` |
| `"reply"` / `"edit"` | `content`, `target: Message` |
| `"unsend"` / `"read"` | `target: Message` |
| `"typing"` | `state: "start" \| "stop"` |
| `"streamText"` | `stream()`, `format?` |
| `"poll"` | `title`, `options` |
| `"poll_option"` | `option`, `poll`, `selected`, `title` |
| `"group"` | `items: Message[]` |
| `"rename"` | `displayName` |
| `"avatar"` | `action: { kind: "set", read(), mimeType } \| { kind: "clear" }` |
| `"addMember"` / `"removeMember"` | `members`; `sender` is the actor when known |
| `"leaveSpace"` | No extra fields; `sender` is the member who left when known |
| `"custom"` | `raw: unknown` |

Outgoing-only variants may be echoed by a provider. Group-management events carry the acting user in `message.sender` when the platform records one.

## Filtering out your own messages

Every message has a universal `direction`; do not depend on an iMessage-only raw field:

```ts
for await (const [space, message] of app.messages) {
  if (message.direction === "outbound") continue;
  // Handle user input.
}
```

When branching by provider, use the stable lowercase ID before [platform narrowing](./platform-narrowing.md):

```ts
import { imessage } from "spectrum-ts/providers/imessage";

for await (const [, message] of app.messages) {
  if (message.platform !== "imessage") continue;
  const imessageMessage = imessage(message);
  // Use iMessage-specific fields here.
}
```
