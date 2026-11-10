# Spectrum webhook troubleshooting

## Every signature fails

- Verify against the raw bytes before JSON parsing.
- Sign `v0:${timestamp}:${rawBody}`.
- Prefix lowercase hex with `v0=`.
- Confirm the received and expected values are both 67 characters before `timingSafeEqual`.
- Confirm the secret belongs to this webhook ID.

## Sporadic stale or invalid signatures

Check server clock synchronization and preserve the five-minute timestamp window. Ensure reverse proxies forward every `X-Spectrum-*` header unchanged.

## Registered but no events arrive

The URL can pass registration yet fail delivery. Confirm HTTPS, public DNS/IP, no private or metadata resolution, a valid certificate, and no redirects. Register the final route rather than a redirecting application root.

## Repeated duplicate events

Delivery is at least once. Deduplicate using `message.id`; use `webhookId + message.id` only when each registration has separate downstream semantics. Acknowledge duplicate events with `2xx`.

## Retry storm or timeout

Return after verification and durable enqueue. Work lasting near or beyond 30 seconds can be treated as failed even if it later completes. Do not synchronously call an LLM in the route.

## Attachments have no bytes

Webhook serialization contains attachment metadata only. Rehydrate through the Spectrum SDK/provider API or another authenticated attachment flow.

## Secret lost

List responses cannot recover it. Delete and register again, or perform a controlled replacement-webhook rollout when using a temporary alternate URL.

Official source: <https://photon.codes/docs/webhooks/troubleshooting>
