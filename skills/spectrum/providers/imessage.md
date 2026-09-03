# iMessage provider

> TypeScript samples below — provider selection, line allocation, routing, quotas, and iMessage capabilities apply across Spectrum SDKs.

Cloud and local iMessage are separate platforms selected by provider import, not configuration modes. Cloud messages use `message.platform === "imessage"`; local messages use `message.platform === "local_imessage"`.

## Cloud provider

Use `imessage` from the Spectrum package for managed cloud infrastructure:

```ts
import { Spectrum } from "spectrum-ts";
import { imessage } from "spectrum-ts/providers/imessage";

const app = await Spectrum({
  providers: [imessage.config()],
});
```

With Spectrum project credentials, the provider discovers the project's cloud lines and renews their tokens at roughly 80% of TTL. Most applications should use automatic discovery.

Explicit clients are available when one SDK instance should subscribe to a deliberate subset of cloud lines:

```ts
const app = await Spectrum({
  providers: [
    imessage.config({
      clients: [
        {
          address: "line-1.example.com:443",
          token: process.env.IMESSAGE_TOKEN!,
          phone: "+15551111111",
        },
      ],
    }),
  ],
});
```

Explicit client tokens are not renewed automatically. Keep them current yourself and never log or commit them.

## Local provider

Reading a Mac's Messages database uses the separate `@spectrum-ts/imessage-local` package:

```bash
npm install spectrum-ts @spectrum-ts/imessage-local
```

```ts
import { Spectrum } from "spectrum-ts";
import { localIMessage } from "@spectrum-ts/imessage-local";

const app = await Spectrum({
  providers: [localIMessage.config()],
});
```

The local provider supports receiving and sending text, attachments, and universal contact content. App cards fall back to their URL. It does not support reactions, threaded replies, edits, unsend, read receipts, effects, group creation, streaming text, chat backgrounds, rename, avatars, native contact-card sharing, or membership writes. Typing signals are accepted as no-ops.

`space.create(user)` creates a deterministic DM reference locally. Group creation throws; use `space.get(chatGuid)` for an existing local group conversation.

## Line model

| Plan | Line allocation | What end users see | Group behavior |
|---|---|---|---|
| **Free / Pro** | Shared pool | A normal iMessage from a pool number that may differ across recipients | Group creation and inbound group-change events are unavailable |
| **Business** | Dedicated project line | The same project-owned number across recipients | Group creation and inbound group-change events are supported |

On shared-pool plans, recipients must be registered as project users before proactive outreach. A successful `space.create()` resolves a transport object; it does not prove that a later send is permitted or that the recipient consented.

Newly added or removed lines become visible at the next managed token renewal. Restart the application when a newly provisioned line must take effect immediately.

## Quotas and consent

Default cloud limits are 5,000 messages per server per day and 50 newly initiated conversations per line per day. Replies in existing conversations do not count as new conversations. Contact Photon before designing around a higher limit.

Transport access is not permission for cold outreach. Initiate only after the recipient has opted in, honor stop requests, and design for genuine conversation rather than one-way blasts.

## Space types and per-phone routing

iMessage spaces narrow to `type: "dm" | "group"` and expose their serving phone when available. With multiple dedicated lines, pin a conversation to one line:

```ts
const im = imessage(app);
const alice = await im.user("+15551111111");

const dm = await im.space.create(alice, {
  phone: "+15559999999",
});

const existing = await im.space.get("any;-;+15551111111", {
  phone: "+15559999999",
});
```

For `space.create`, omitting `phone` lets Spectrum choose from the available dedicated lines. For `space.get`, `phone` is required when more than one dedicated line could own the chat. Shared-pool routing ignores the dedicated-line phone selection.

Group creation works on dedicated cloud lines only. Shared cloud lines and the local provider reject group creation.

## Capability semantics

Before relying on a provider-specific action, identify whether iMessage guarantees native support, a fallback, warn-and-skip behavior, an accepted no-op, or a thrown error. Read [`../capability-semantics.md`](../capability-semantics.md) and the exact feature reference.

This matters for reactions, replies, edits, unsend, reads, effects, backgrounds, app cards, group metadata, attachments, and contact-card sharing. A resolved promise does not by itself prove the recipient saw the action.

## Feature references

Each feature has a focused reference so the agent does not load the entire iMessage surface for one operation.

| Feature | Read |
|---|---|
| Message effects | [`imessage/message-effects.md`](./imessage/message-effects.md) |
| Tapback reactions | [`imessage/tapback-reactions.md`](./imessage/tapback-reactions.md) |
| Chat renaming | [`imessage/chat-renaming.md`](./imessage/chat-renaming.md) |
| Chat backgrounds | [`imessage/chat-backgrounds.md`](./imessage/chat-backgrounds.md) |
| Group avatars | [`imessage/group-avatars.md`](./imessage/group-avatars.md) |
| Group membership | [`imessage/group-membership.md`](./imessage/group-membership.md) |
| Inbound group events | [`imessage/inbound-group-events.md`](./imessage/inbound-group-events.md) |
| Inbound read receipts | [`imessage/inbound-read-receipts.md`](./imessage/inbound-read-receipts.md) |
| App and mini-app content | [`imessage/apps.md`](./imessage/apps.md) |
| Contact-card sharing | [`imessage/contact-card-sharing.md`](./imessage/contact-card-sharing.md) |
| Provider message metadata | [`imessage/message-metadata.md`](./imessage/message-metadata.md) |
| Fetching attachments | [`imessage/fetching-attachments.md`](./imessage/fetching-attachments.md) |
| Troubleshooting | [`imessage/troubleshooting.md`](./imessage/troubleshooting.md) |

## See also

- [Spectrum iMessage connection and routing](https://photon.codes/docs/spectrum-ts/providers/imessage/connection-and-routing)
- [Spectrum iMessage messaging features](https://photon.codes/docs/spectrum-ts/providers/imessage/messaging-features)
- [`../spaces-and-users.md`](../spaces-and-users.md) for proactive vs reactive conversations
- [`../reactions-and-replies.md`](../reactions-and-replies.md) for universal action APIs
- The repository's `imessage` skill for low-level hosted or local iMessage SDKs
