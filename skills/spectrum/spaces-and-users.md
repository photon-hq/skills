# Spaces and users

> TypeScript samples below — the space/user model is language-neutral.

A **space** is a conversation. A **user** is a participant. Both carry a `__platform` tag.

## Space interface

| Method | Description |
|---|---|
| `send(...content)` | Send one or more content items and return the resulting outbound message(s) when the provider supplies them. |
| `startTyping()` / `stopTyping()` | Show / hide typing indicator. No-op without support. |
| `responding(fn)` | Run `fn` wrapped in typing — guarantees indicator is cleared even on throw. |
| `edit(message, newContent)` | Edit a previously sent message. |
| `unsend(message)` | Retract a previously sent message. |
| `read(message)` | Mark the conversation read through an inbound message. |
| `getMessage(id)` | Look up a message by ID. |
| `getMembers()` / `add(users)` / `remove(users)` / `leave()` | Read or change group membership. |
| `getDisplayName()` / `rename(name)` | Read or change the chat title. |
| `getAvatar()` / `avatar(input)` | Read or set the chat avatar. |

Unsupported operations routed through `send` — including edit, unsend, read, rename, avatar, membership, typing, reactions, and replies — log a structured warning and resolve without a message. Resolver failures (`space.create` / `space.get`) and omitted platform-wise reads such as `getMembers()` throw to the caller instead.

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

The returned space satisfies the generic `Space` interface and carries platform-specific fields (e.g. `type: "dm" | "group"` on iMessage).

Cloud iMessage `space.get(id)` needs no `phone` in shared mode or when exactly one dedicated client is configured. With multiple dedicated clients, including auto-scaled lines, pass `{ phone }` so Spectrum can route the existing chat through the line that owns it. The local provider takes only the chat GUID: `localIMessage(app).space.get(chatGuid)`.

## Reaching out vs replying

`space.create(...)` is the **proactive** path: it opens a conversation so your agent can send the first message, with no inbound event required. You don't need a `[space, message]` pair from `app.messages` to start talking.

```ts
const im = imessage(app);
const space = await im.space.create(await im.user("+15551234567"));
await space.send("Your requested reminder is ready. Reply STOP to opt out.");
```

`space.create` is a transport path, not permission to cold-contact someone. Initiate only after the recipient has opted in; unsolicited outreach can cause shared or dedicated lines to be flagged. **Replying** is the reactive path: iterate `app.messages` and send into the `space` you're handed. Reach for `space.create` / `space.get` when the agent initiates; use the loop's `space` when it responds.

For Spectrum Cloud iMessage, proactive outreach is quota-sensitive: the default limit is 50 new conversations per line per day, alongside 5,000 total messages per server per day. Replies inside existing conversations do not count as new conversations. On Free and Pro shared-pool plans, the recipient must also be registered as a project user in the Photon Dashboard or the send fails with `Target not allowed for this project`; dedicated Business lines do not use that allowlist. See the [iMessage provider quotas](./providers/imessage.md#quotas) and [official troubleshooting guide](https://photon.codes/docs/spectrum-ts/troubleshooting/imessage#target-not-allowed-for-this-project).
