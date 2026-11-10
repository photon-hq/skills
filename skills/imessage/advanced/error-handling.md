# Advanced iMessage error handling

Prefer specific SDK error classes, then inspect `error.code`. Keep a fallback for unknown future codes.

```ts
import {
  AuthenticationError,
  ConnectionError,
  ErrorCode,
  IMessageError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "@photon-ai/advanced-imessage";

try {
  await im.messages.get("missing-guid");
} catch (error) {
  if (
    error instanceof NotFoundError &&
    error.code === ErrorCode.messageNotFound
  ) {
    return undefined;
  }

  if (error instanceof RateLimitError) {
    console.error("rate-limited", error.code);
  } else if (error instanceof AuthenticationError) {
    console.error("authentication failed", error.code);
  } else if (error instanceof ValidationError) {
    console.error("invalid operation", error.code);
  } else if (error instanceof ConnectionError) {
    console.error("transport failure", error.code);
  } else if (error instanceof IMessageError) {
    console.error("iMessage operation failed", error.code);
  } else {
    throw error;
  }
}
```

`ServiceError` is not an exported class in the current package. Use `ConnectionError` for network and transport failures and `IMessageError` as the common SDK fallback.

## Common code families

| Category | Current codes |
|---|---|
| Authentication | `unauthenticated`, `tokenExpired`, `tokenBlocked`, `unauthorized` |
| Rate limits | `dailyLimitExceeded`, `recipientLimitExceeded`, `uploadRateExceeded`, `contentDuplicateExceeded`, `recipientCoolingDown`, `recipientLocked`, `sendReceiveRatioExceeded` |
| Duplicate writes | `duplicateMessage` |
| Not found | `chatNotFound`, `messageNotFound`, `attachmentNotFound`, `addressNotFound`, `sharedFriendLocationNotFound`, `groupIconNotFound`, `pollNotFound` |
| Validation | `invalidArgument`, `preconditionFailed`, `operationNotSupported`, `attachmentNotReady`, `privateApiUnavailable` |
| Infrastructure | `serviceUnavailable`, `timeout`, `internalError`, `databaseError`, `networkError` |

## Retry policy

- Retry only errors marked retryable or clearly transient infrastructure failures.
- Use exponential backoff with jitter and an upper bound.
- Do not retry validation, authentication, not-found, cooling-down, or policy errors blindly.
- Supply `clientMessageId` for writes that a queue may repeat after a crash or timeout.
- Treat `duplicateMessage` as evidence that the logical write may already have succeeded; reconcile instead of sending again.
- Use `AbortSignal` or request deadlines for bounded user-facing operations.
- Never rotate or print tokens as an automatic error-recovery step.

Unknown `error.code` values must be logged without secrets or user content and surfaced safely rather than coerced into a known category.

Official source: <https://photon.codes/docs/advanced-kits/imessage/error-handling>
