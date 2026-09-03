# Spectrum webhook delivery and retries

Delivery is at least once. A retry of a message event carries the same logical `message.id`, so every consumer must be idempotent.

## Endpoint contract

- Return any `2xx` as soon as signature verification and durable queue or storage succeeds.
- Do not run an LLM, tool call, or slow database workflow before acknowledgement.
- Requests exceeding the documented 30-second delivery timeout are treated as failed and can retry.
- Network errors, timeouts, and retryable server responses retry with backoff.
- Permanent URL-policy failures such as plain HTTP, private addresses, or redirects are fatal rather than retried.
- Unknown future event types should be safely recorded and acknowledged.

Recommended handler shape:

```ts
verify(rawBody, headers);
const event = JSON.parse(rawBody);

const eventId =
  typeof event?.message?.id === "string"
    ? event.message.id
    : typeof event?.id === "string"
      ? event.id
      : `${event?.event ?? "unknown"}:${headers.timestamp}`;

await durableQueue.add(event, {
  jobId: `${headers.webhookId}:${eventId}`,
});

return new Response("accepted", { status: 202 });
```

Choose the key only after validating the payload shape. Known message events use `message.id`. A future event without `message` uses another documented event ID or a stable fallback derived from the webhook registration, event discriminator, and signed timestamp. The fallback must not throw before the event is durably recorded.

## Idempotent processing

Use a unique database constraint or queue job ID based on `message.id`. For consumers that intentionally distinguish registrations, use `${webhookId}:${messageId}`. Return `2xx` when the durable inbox already contains the event; do not repeat downstream effects.

Downstream writes must also be idempotent. A queue deduplication key only prevents duplicate jobs; it does not automatically protect a payment, message send, database mutation, or external tool call that can be retried after a worker crash.

Record status, latency, attempts, dedup hits, and failures without storing signing secrets or unbounded message content. Move repeatedly failing work to a dead-letter or poison-event path instead of causing the HTTP delivery to retry indefinitely.

## Failure boundary

Return a non-`2xx` response when signature verification, JSON parsing, or durable enqueue fails. Once durable storage succeeds, acknowledge the HTTP delivery and let the queue own retries. Do not keep Photon retrying merely because downstream business logic failed after the event was accepted.

Official source: <https://photon.codes/docs/webhooks/delivery>
