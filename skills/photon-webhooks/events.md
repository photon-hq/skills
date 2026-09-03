# Spectrum webhook event wire format

Every delivery is an HTTP `POST` with JSON and these headers:

| Header | Meaning |
|---|---|
| `X-Spectrum-Event` | Event name; currently `messages`. |
| `X-Spectrum-Webhook-Id` | Registration receiving this delivery. |
| `X-Spectrum-Timestamp` | Unix timestamp included in the signed input. |
| `X-Spectrum-Signature` | `v0=` plus lowercase HMAC-SHA256 hex. |

The body has the top-level shape:

```json
{
  "event": "messages",
  "space": {},
  "message": {}
}
```

`event` is the required discriminator and currently mirrors `X-Spectrum-Event`. Validate it before routing the payload, and keep a forward-compatible default for future event names.

`space` and `message` are serialized Spectrum records. Function properties such as `read()`, `stream()`, `reply()`, and `react()` are removed by JSON serialization.

Important message semantics:

- `direction` is always `"inbound"`.
- `timestamp` is an ISO 8601 platform event time.
- `sender.id` is provider-defined, such as an E.164 iMessage address or WhatsApp contact ID.
- `space` is repeated inside the message for convenience.
- `content` uses the same discriminated types as Spectrum, but lazy binary accessors are absent.

Attachments carry ID, name, MIME type, and size metadata, not bytes or a public download URL.

## Idempotency

`message.id` is stable across retries and all webhook registrations for the project. Use it as the project-wide deduplication key. When the downstream system intentionally processes each registered endpoint independently, use `webhookId + message.id`.

For a future event without `message.id`, build a stable key from the delivery's webhook ID, event discriminator, and another documented event identifier. Do not access `message.id` before confirming the payload shape.

Unknown future events or content types should be recorded safely and acknowledged with `2xx`, not crash-looped.

There is no general HTTP send-message endpoint attached to webhook delivery; use Spectrum or a low-level SDK for outbound messaging.

Official source: <https://photon.codes/docs/webhooks/events>
