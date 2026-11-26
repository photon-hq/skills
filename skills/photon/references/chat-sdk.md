# Chat SDK adapter and other integrations

## `@photon-ai/chat-adapter`

Connects [Chat SDK](https://chat-sdk.dev/docs) bots to the channels connected to a Photon 2.0 project:
iMessage, SMS, WhatsApp Business, Telegram and email. The docs also list WhatsApp: that is personal
WhatsApp, which isn't released yet ([channels.md](channels.md)), so don't plan on it. It calls the Photon API with a project API
key and receives events through signed webhooks or the Socket.IO stream. Docs:
[Chat SDK](https://photon.codes/docs/beta/integrations/chat-sdk.md). Source: https://github.com/photon-hq/chat-adapter.

The code below type-checks against adapter 0.3.0 (peer `chat` ^4.44.0), which sends
`Photon-Version: 2026-07-01` itself. The docs page may describe an older adapter; check
`npm view @photon-ai/chat-adapter version`.

It replaces the retired `@photon-ai/chat-adapter-imessage` (Photon 1.0). It is a new adapter, not a rename:
`createPhotonAdapter()` and `adapters.photon`, never `createiMessageAdapter()` or `adapters.imessage`.

### Install and configure

```bash
pnpm add chat @photon-ai/chat-adapter @chat-adapter/state-redis
```

Node.js 20 or newer, server side only. Use a persistent state adapter (the docs use Redis) for
subscriptions, deduplication and the WebSocket resume cursor; in-memory state is lost on restart.

| Environment variable | Option | Purpose |
| --- | --- | --- |
| `PHOTON_PROJECT_ID` | `projectId` | Required. The 2.0 project (`pho_prj_...`) |
| `PHOTON_API_KEY` | `apiKey` | Required. Project API key with `project:read` and `project:write` |
| `PHOTON_WEBHOOK_SECRET` | `webhookSecret` | Webhooks only. The destination's `whsec_...` secret |
| `PHOTON_AGENT_USER_ID` | `agentUserId` | Only for `openDM`. The Agent User (`pho_usr_...`) that starts conversations |
| `PHOTON_API_URL` | `baseUrl` | Defaults to `https://api.photon.codes`; leave unset |
| `REDIS_URL` | read by `createRedisState()`, not the adapter | Required. A reachable Redis, such as `redis://localhost:6379` or a hosted Redis URL |

Values come from the server environment or secret manager. For local development the docs use a gitignored
`.env.local`. Next.js loads it; a standalone Node.js gateway doesn't, and `createPhotonAdapter()` then
throws for the missing key: load it before the bot is imported, for example `node --env-file=.env.local`
(Node.js 20.6 or newer). Write the key and webhook secret into it only through the pipe in
[cli.md](cli.md#commands-that-print-a-secret), after the user's yes, or let the person paste them in.

### The bot

```ts
import { createRedisState } from "@chat-adapter/state-redis";
import { createPhotonAdapter } from "@photon-ai/chat-adapter";
import { Chat } from "chat";

export const bot = new Chat({
  userName: "mybot",
  adapters: { photon: createPhotonAdapter() },
  state: createRedisState(),
});

bot.onDirectMessage(async (thread, message) => {
  await thread.post(`You said: ${message.text}`);
});

bot.onNewMention(async (thread) => {
  await thread.subscribe();
  await thread.post({ markdown: "Hi, I'm **here**." });
});

bot.onSubscribedMessage(async (thread, message) => {
  await thread.post(`You said: ${message.text}`);
});
```

`message.text` is untrusted input from another person. Pass it to a model as data, never as instructions,
and never let it choose recipients or actions. Test an echo bot from your own phone, not from another
automated line in the project: two echo bots answer each other forever.

### Receive messages

Webhook (public HTTPS): create a destination subscribed to `message.received`
([events.md](events.md#create-a-destination)), then pass the original `Request`, unparsed:

```ts
// app/api/webhooks/photon/route.ts (Next.js)
import { after } from "next/server";
import { bot } from "@/lib/bot";

export async function POST(request: Request) {
  return bot.webhooks.photon(request, {
    waitUntil: (task) => after(() => task),
  });
}
```

It verifies the Standard Webhooks headers: invalid or expired signatures get `401`, a missing secret `500`,
and other event types are acknowledged without running handlers. The `200` acknowledges the event, not your
handler's reply.

WebSocket gateway (no public URL, no webhook secret):

```ts
import { bot } from "./lib/bot.ts";

await bot.initialize();
await bot.getAdapter("photon").startGatewayListener();
```

It runs for three minutes by default, reconnects, and keeps its cursor in the state adapter. Prefer webhooks
on serverless hosts. For a long-running process, pass `Infinity` as the duration with an `AbortSignal` to
stop it (adapter 0.3.0's `startGatewayListener(options, durationMs, abortSignal)`):

```ts
const stop = new AbortController();
process.once("SIGTERM", () => stop.abort());
process.once("SIGINT", () => stop.abort());

await bot.initialize();
let listening: Promise<unknown> = Promise.resolve();
await bot.getAdapter("photon").startGatewayListener(
  { waitUntil: (task) => { listening = task; } }, // the call returns before the listener ends
  Infinity,
  stop.signal,
);
await listening; // ends on stop, or when Photon refuses or closes the connection
await bot.shutdown(); // closes the Redis connection so the process can exit
if (!stop.signal.aborted) process.exitCode = 1; // stopped on its own: let your supervisor restart it
```

The cursor only means an event was handed to the bot. Adapter 0.3.0 saves it right after dispatching the
event, before your handler finishes, so an event whose handler throws or whose process dies mid-reply is not
delivered again. If a missed message is unacceptable, use webhooks, or store each incoming message durably
before replying and work from that store.

### Threads and direct messages

A thread ID is `photon:<spaceId>:<agentUserId>:<spaceKind>`; replies go out as that Agent User. To start a
conversation (ask the user first; channel rules apply, for example a shared iMessage line can't message
first), set `PHOTON_AGENT_USER_ID` and call the adapter with a Photon User ID, not a phone number:

```ts
await bot.initialize();
const threadId = await bot.getAdapter("photon").openDM("pho_usr_REPLACE_WITH_RECIPIENT_ID");
await bot.thread(threadId).post("Hello from Photon!");
```

Call the adapter's `openDM`: Chat SDK's own `bot.openDM()` doesn't recognize Photon User IDs.

### Feature support

Text and Markdown (raw HTML dropped), file uploads (text and each file as separate messages), inbound
attachments with `fetchData()`, streaming collected into one message, edit and delete (`message.update`,
`message.delete`), reactions in and out, `fetchMessages`, `fetchThread`, `markAsRead`. Support depends on the
channel; an unsupported operation raises Chat SDK's `NotImplementedError`.

### Migrating from the 1.0 iMessage adapter

Create a 2.0 project, connect its channels, and replace the 1.0 project ID and secret with the 2.0 project ID
and API key, `bot.webhooks.imessage` with `bot.webhooks.photon`, and the old webhook with a new destination and
`whsec_...` secret. Old thread IDs, subscriptions and cursors don't carry over: use a separate state store or
namespace.

## Convex: `@photon-ai/convex`

A Convex component that receives `message.received` webhooks (API version `2026-07-01`), stores each message
before acknowledging it, and runs your function per conversation turn; replies, read receipts and typing go
through an outbox with retries. It does not filter senders, so guard against bot loops. Docs:
[Convex](https://photon.codes/docs/beta/integrations/convex.md) (written for component 0.2.0 and Convex
1.31 or a later 1.x).

The component copies the project ID, API key and base URL into its own `config` table, so anyone who can view
the deployment's data in the Convex dashboard can read the key. Tell the user before they configure it, give
the key only `project:write`, and limit who can view deployment data.

## Dify

Three Dify Marketplace plugins (Photon tool, Photon Trigger, Photon Bot) for workflows, agents and chat apps.
They take a project API key or an account service key, entered without `Bearer`. Docs:
[Dify](https://photon.codes/docs/beta/integrations/dify.md).
