# Spaces and users

> TypeScript samples below — the space/user model is language-neutral.

A **space** is a conversation. A **user** is a participant. Both carry a `__platform` tag.

## Space interface

| Method | Description |
|---|---|
| `send(...content)` | Send one or more content items and return the resulting outbound message(s) when the provider supplies them. |
| `startTyping()` / `stopTyping()` | Show / hide typing indicator. Unsupported providers may warn and skip or accept a no-op. |
| `responding(fn)` | Run `fn` wrapped in typing — guarantees indicator is cleared even on throw. |
| `edit(message, newContent)` | Edit a previously sent message. |
| `unsend(message)` | Retract a previously sent message. |
| `read(message)` | Mark the conversation read through an inbound message. |
| `getMessage(id)` | Look up a message by ID. |
| `getMembers()` / `add(users)` / `remove(users)` / `leave()` | Read or change group membership. |
| `getDisplayName()` / `rename(name)` | Read or change the chat title. |
| `getAvatar()` / `avatar(input)` | Read or set the chat avatar. |

Universal methods do not imply universal support. Before relying on one of these operations, read the [capability and fallback semantics](./capability-semantics.md) and the selected provider reference.

## Typing indicators

`responding` is the recommended pattern:

```ts
await space.responding(async () => {
  const result = await generateResponse(message);
  await space.send(result);
});
```

Or via the app helper: `await app.responding(space, async () => { ... })`.

## Creating a space

Use [platform narrowing](./platform-narrowing.md) for the platform instance, then pass users:

```ts
import { imessage } from "spectrum-ts/providers/imessage";

const im = imessage(app);
const alice = await im.user("+15551111111");
const bob = await im.user("+15552222222");

const dm = await im.space.create(alice);
await dm.send("Hello Alice.");

// Cloud iMessage group creation requires a dedicated Business line.
const group = await im.space.create([alice, bob]);
await group.send("Welcome to the group.");

// Reference an existing cloud conversation by its platform ID. Supplying the
// serving line also works with one dedicated line and is required with several.
const existing = await im.space.get("any;-;+15551111111", {
  phone: "+15559999999",
});
await existing.send("Hello again.");
```

The returned space satisfies the generic `Space` interface and carries platform-specific fields (e.g. `type: "dm" | "group"` on iMessage). The example pins a cloud serving line; before calling iMessage `space.create` or `space.get`, read the provider's [space and routing constraints](./providers/imessage.md#space-types-and-per-phone-routing).

## Reaching out vs replying

`space.create(...)` is the **proactive** path: it opens a conversation so your agent can send the first message, with no inbound event required. You don't need a `[space, message]` pair from `app.messages` to start talking.

```ts
const im = imessage(app);
const space = await im.space.create(await im.user("+15551234567"));
await space.send("Your requested reminder is ready. Reply STOP to opt out.");
```

`space.create` is a transport path, not permission to cold-contact someone. Initiate only after the recipient has opted in; unsolicited outreach can cause shared or dedicated lines to be flagged. **Replying** is the reactive path: iterate `app.messages` and send into the `space` you're handed. Reach for `space.create` / `space.get` when the agent initiates; use the loop's `space` when it responds.

Before proactive iMessage outreach, read the provider's [quotas, shared-plan allowlist, and routing constraints](./providers/imessage.md#quotas). Creating a `Space` does not guarantee that a later send is permitted.
