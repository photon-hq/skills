# Production agent architecture

Split each conversation turn into independently queued stages:

```text
inbound -> batch/debounce -> flush -> mark read -> generate -> paced send
```

Track the current job for every stage in a per-chat in-flight record. When a follow-up arrives, cancel stale stage jobs and carry already-drained messages forward.

Why separate stages:

- Each stage is independently cancellable.
- A worker crash retries only the current stage.
- Every retryable send uses a persisted deterministic idempotency key or an equivalent provider-side deduplication record.
- Read and send pacing can have different timing.
- A new user message can stop generation before an obsolete reply is delivered.

Create the idempotency key when the send job is first persisted, not inside each attempt. Reuse it only for retries of that one logical message; unrelated sends must never share a key.

The extra queue-hop latency is acceptable for conversational agents. Consolidate stages only when the product genuinely requires low-latency tool behavior and can preserve cancellation, durable state, and idempotency another way.

Official source: <https://photon.codes/docs/best-practices/architecture>
