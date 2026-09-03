# WhatsApp Business error handling

All SDK failures derive from `WhatsAppError`. Narrow the class, then branch on `error.code` and `error.retryable`.

## Bounded retry loop

Retry the failed operation, not only the delay:

```ts
import { WhatsAppError } from "@photon-ai/whatsapp-business";

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

async function sendTextWithRetry(
  to: string,
  text: string,
  options: { maxAttempts?: number; signal?: AbortSignal } = {},
) {
  const maxAttempts = options.maxAttempts ?? 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    options.signal?.throwIfAborted();

    try {
      return await client.messages.send(
        { to, text },
        { signal: options.signal },
      );
    } catch (error) {
      if (!(error instanceof WhatsAppError)) throw error;

      if (error.code === "preconditionFailed") {
        // The 24-hour free-form window may have expired.
        // Select an approved template instead of retrying the same text.
        throw error;
      }

      if (!error.retryable || attempt === maxAttempts) throw error;

      const delayMs = Math.min(500 * 2 ** (attempt - 1), 8_000);
      const jitteredDelay = Math.floor(delayMs * (0.75 + Math.random() * 0.5));
      await sleep(jitteredDelay, options.signal);
    }
  }

  throw new Error("unreachable");
}
```

Use a deterministic application idempotency key or provider-supported deduplication mechanism when a retry could occur after the provider accepted the send but before the application recorded success.

## Error fields

| Field | Meaning |
|---|---|
| `code` | Canonical SDK code. |
| `retryable` | Whether retry with bounded backoff is safe. |
| `grpcCode` | Numeric gRPC status. |
| `context` | `Record<string, string>` with structured server context. Treat keys as diagnostic, not a stable public schema. |
| `cause` | Underlying transport error when present. |

Current codes are `unauthenticated`, `unauthorized`, `rateLimitExceeded`, `notFound`, `invalidArgument`, `preconditionFailed`, `serviceUnavailable`, `timeout`, `internalError`, and `networkError`.

Retry only retryable failures. Bound attempts and delay, honor `AbortSignal`, and avoid retrying invalid templates, expired authorization, policy failures, or malformed media. Never print access tokens, app secrets, phone-number IDs, signed URLs, or unredacted `context` values when they may contain sensitive provider data.

Official source: <https://photon.codes/docs/advanced-kits/whatsapp/error-handling>
