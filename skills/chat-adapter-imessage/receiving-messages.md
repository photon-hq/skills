# Receiving messages

The adapter supports two receiving paths. Use signed Spectrum Cloud webhooks for serverless applications and a gateway listener for a process that can hold a live connection.

## Spectrum Cloud webhooks

Pass the original `Request` to the Chat SDK webhook handler. The adapter verifies the signature, parses the event, and routes it into the bot.

```ts
import { after } from "next/server";
import { bot } from "@/lib/bot";

export async function POST(request: Request): Promise<Response> {
  return bot.webhooks.imessage(request, {
    waitUntil: (task) => after(() => task),
  });
}
```

Configure `IMESSAGE_WEBHOOK_SECRET` or a trusted `webhookVerifier` on the adapter. Do not parse the body before handing the request to the adapter because verification depends on the exact bytes received.

A webhook response should acknowledge quickly. Spectrum retries failed deliveries and delivers at least once, so make downstream work idempotent with the delivery ID and message ID.

## Gateway listener

Use the gateway when a long-running process can consume the Spectrum message stream directly.

```ts
await bot.adapters.imessage.startGatewayListener(
  { waitUntil: (task) => task },
  600_000,
);
```

In a serverless environment, expose an authenticated route or scheduled job that holds the listener open for the platform's permitted duration. Overlap scheduled runs only when duplicate processing is safely deduplicated.

## Choosing a receiving path

| Environment | Preferred path |
|---|---|
| Serverless function or route | Signed webhook |
| Long-running worker | Gateway listener |
| Existing Chat SDK deployment | The bot's registered iMessage webhook |
| Development against Spectrum Cloud | Webhook through a secure tunnel, or a temporary gateway listener |

Do not start both paths for the same project and event stream unless the application deliberately deduplicates across them.

## Replies from webhook deliveries

The adapter can rebuild a direct-message thread from a verified webhook and send a reply without a live gateway connection. Group resolution can depend on line and session context; with multiple lines or an unseen group, use a gateway-observed thread rather than assuming that a cold lookup will succeed.

## Failure handling

- Reject unsigned, mismatched, or stale webhook deliveries.
- Return a non-success response only when Spectrum should retry the delivery.
- Persist or queue accepted work before acknowledging it.
- Stop gateway listeners cleanly during process shutdown.
- Treat repeated deliveries as expected transport behavior, not as separate user messages.

See [Spectrum Webhooks](https://photon.codes/docs/webhooks/overview) for registration and delivery semantics.
