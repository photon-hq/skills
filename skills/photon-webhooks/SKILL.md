---
name: photon-webhooks
description: >
  Build or review Spectrum Webhook consumers. Use for public HTTPS endpoints, serverless routes, raw request bodies,
  HMAC-SHA256 verification, `X-Spectrum-*` headers, timestamp freshness, webhook registration, one-time signing
  secrets, retries, at-least-once delivery, duplicate events, queues, rotation, lost secrets, and troubleshooting.
license: MIT
metadata:
  author: photon-hq
  version: '1.0.0'
---

# Photon Webhooks

Spectrum Webhooks deliver project events to an existing HTTPS backend. Use them when an application needs signed inbound HTTP delivery instead of a long-lived Spectrum message stream.

## Delivery contract

A correct webhook consumer preserves the original request bytes, verifies the signature before parsing JSON, checks timestamp freshness, acknowledges quickly, and makes downstream processing idempotent.

Keep these boundaries explicit:

- Every registered URL has its own signing secret.
- The signing secret is returned once; store it in a secret manager.
- Delivery is at least once, so duplicate events are expected.
- Return a successful response quickly and move slow work to a queue.
- A webhook is an inbound delivery mechanism, not a general public HTTP send-message endpoint. Use Spectrum or a low-level SDK for outbound messaging.

## Implementation procedure

When asked to add Spectrum Webhooks to an application:

1. Register a public HTTPS URL through the current Spectrum API.
2. Capture the one-time signing secret without printing or committing it.
3. Configure the framework to preserve the raw request body.
4. Verify the timestamp and HMAC before parsing or acting on the payload.
5. Deduplicate by the delivery identifier and the underlying event or message identifier.
6. Return `2xx` before slow application work begins.
7. Process the verified event in a queue or background task.
8. Exercise a duplicate delivery and a failed-delivery retry before calling the integration complete.

## How this skill is organized

Each topic lives in its own file in this directory. Read the file relevant to the user's question.

| File | When to consult |
|---|---|
| [`quickstart.md`](./quickstart.md) | Registering a webhook, capturing the secret, creating a minimal endpoint, and validating the first delivery. |
| [`events.md`](./events.md) | Event envelopes, headers, identifiers, content types, and forward-compatible event handling. |
| [`verifying-signatures.md`](./verifying-signatures.md) | Raw-body HMAC verification, timestamp freshness, constant-time comparison, and examples for common runtimes. |
| [`delivery-and-retries.md`](./delivery-and-retries.md) | At-least-once delivery, acknowledgement, retry behavior, idempotency, queues, and poison events. |
| [`managing.md`](./managing.md) | Listing, registering, deleting, and rotating webhooks through the Spectrum API. |
| [`troubleshooting.md`](./troubleshooting.md) | Reachability, body mutation, signature failures, duplicate processing, missing secrets, and retry diagnosis. |

## See also

- [Spectrum Webhooks documentation](https://photon.codes/docs/webhooks/overview)
- The `spectrum` skill for `app.webhook(...)` and runtime message handling
- The `photon-api` skill for webhook registration and management over HTTPS
- The `chat-adapter-imessage` skill when Chat SDK should receive iMessage webhook deliveries directly
