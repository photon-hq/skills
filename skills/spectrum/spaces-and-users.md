# Spaces and users

> TypeScript samples below — the space and user model is language-neutral.

A **Space** is a conversation. A **User** is a participant on one provider. Both carry a platform tag and can be narrowed back to provider-specific types.

## Space interface

| Method | Description |
|---|---|
| `send(...content)` | Send one or more content items and return the resulting outbound message or messages when the provider supplies them. |
| `startTyping()` / `stopTyping()` | Show or hide a typing indicator. Unsupported providers may warn and skip or accept a no-op. |
| `responding(fn)` | Run `fn` wrapped in typing and clear the indicator even when the callback throws. |
| `edit(message, newContent)` | Edit a previously sent message where supported. |
| `unsend(message)` | Retract a previously sent message where supported. |
| `read(message)` | Mark the conversation read through an inbound message. |
| `getMessage(id)` | Look up a message by ID when the provider implements the read capability. |
| `getMembers()` / `add(users)` / `remove(users)` / `leave()` | Read or change group membership. |
| `getDisplayName()` / `rename(name)` | Read or change the conversation title. |
| `getAvatar()` / `avatar(input)` | Read, set, or clear the conversation avatar. |

Universal methods do not imply universal support. Before relying on one of these operations, read [`capability-semantics.md`](./capability-semantics.md) and the selected provider reference.

## Typing indicators

`responding` is the recommended pattern for slow work:

```ts
await space.responding(async () => {
  const result = await generateResponse(message);
  await space.send(result);
});
```

Or use the app helper:

```ts
await app.responding(space, async () => {
  await space.send(await generateResponse(message));
});
```

`responding()` guarantees the stop-typing path runs even when the callback throws. A resolved typing call still does not prove the provider rendered an indicator; some providers accept typing as a documented no-op.

## Resolving users

Use the narrowed platform instance to resolve a provider-specific identifier:

```ts
import { imessage } from "spectrum-ts/providers/imessage";

const im = imessage(app);
const alice = await im.user("+15551111111");
const bob = await im.user("+15552222222");
```

For iMessage, normalize user-entered phone numbers to E.164 before resolution. Other providers use different identifiers; do not assume that a phone number, email, Slack ID, or Telegram ID is interchangeable.

## Creating and resolving spaces

Pass a user for a DM or an array of users for a group where the provider supports group creation:

```ts
const dm = await im.space.create(alice);
await dm.send("Hello Alice.");

const group = await im.space.create([alice, bob]);
await group.send("Welcome to the group.");

const existing = await im.space.get("any;-;+15551111111", {
  phone: "+15559999999",
});
await existing.send("Hello again.");
```

The returned value satisfies the generic `Space` interface and carries provider-specific fields after narrowing. For iMessage, group creation and per-phone routing depend on cloud vs local mode, shared vs dedicated allocation, and the number of configured lines. Read [`providers/imessage.md`](./providers/imessage.md) before copying this group or routing example.

Resolvers and space reads sit outside the send pipeline. When a provider does not implement `space.create`, `space.get`, `getMessage`, `getMembers`, `getAvatar`, or `getDisplayName`, those operations throw rather than silently skipping.

## Reaching out vs replying

`space.create(...)` is the proactive path: it opens or resolves a conversation so the application can send first, without an inbound `[space, message]` pair.

```ts
const im = imessage(app);
const recipient = await im.user("+15551234567");
const space = await im.space.create(recipient);
await space.send("Your requested reminder is ready. Reply STOP to opt out.");
```

Creating a `Space` is a transport path, not permission to cold-contact someone. Initiate only after the recipient has opted in. Shared and sandbox plans can add additional allowlist or inbound-first constraints, and iMessage lines have limits on newly initiated conversations.

Replying is the reactive path: iterate `app.messages` and use the `space` that arrived with the inbound message. That space is already bound to the correct conversation and serving route.

## Group and metadata operations

Provider support varies for membership, display names, and avatars:

```ts
await group.add(charlie);
await group.remove(bob);
await group.rename("Project launch");
await group.avatar("./group-icon.png");
```

Use generic methods first, then narrow only when the provider exposes extra fields or actions. Provider-originated group changes can also arrive as `addMember`, `removeMember`, `leaveSpace`, `rename`, or `avatar` message content.

## See also

- [Spectrum spaces and users documentation](https://photon.codes/docs/spectrum-ts/spaces-and-users)
- [`providers/imessage.md`](./providers/imessage.md) for iMessage creation and routing constraints
- [`platform-narrowing.md`](./platform-narrowing.md) for provider-specific space and user fields
- [`content/rename-avatar-and-membership.md`](./content/rename-avatar-and-membership.md) for metadata and membership actions
- [`capability-semantics.md`](./capability-semantics.md) for send-routed vs resolver failure behavior
