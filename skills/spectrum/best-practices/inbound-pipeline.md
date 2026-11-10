# Spectrum inbound pipeline

People send messages in bursts. Debounce per chat, then generate one response from the whole burst.

## Keep queued messages in storage

Insert each inbound message into a `batch_queue` table and schedule or move one flush job. Do not copy messages into the job payload at enqueue time. If the job is cancelled before it starts, rows remain available for the next flush.

```text
message -> insert row -> reset flush run_at -> handler leases rows -> generate -> commit result -> delete rows
```

The handler should claim or lease the selected rows without deleting them. Delete the rows only after the turn completes successfully and the resulting state or outbound work is durable. A worker exit after claiming must leave the burst available for lease expiry and retry.

## Carry forward drained work

Cancellation can still happen while generation is running. Before releasing or deleting claimed rows, transactionally move their content or stable references into `carried_messages`. The next batch prepends them as earlier context rather than treating them as brand-new input.

Do not use this sequence:

```text
read rows -> delete rows -> generate -> maybe carry on cancellation
```

A crash after deletion and before carry-forward loses the burst. Prefer one of:

- retain leased `batch_queue` rows until successful completion; or
- transactionally move them to `carried_messages` before deleting them.

## Chain-aware cancellation

Store `cancelled_at` in a per-chat in-flight record and cancel the queue job. Inside long stages, poll the flag and abort active work.

```ts
const inflight = await readInflight(chatId);
if (inflight?.cancelled_at && inflight.cancelled_at > chainStartedAt) {
  abortController.abort();
}
```

Compare the timestamp to this chain's start. A stale cancellation flag from an older chain must not kill the replacement chain.

Recommended invariant: no message leaves durable storage until successful processing or a transactional carry-forward, and no claimed message is discarded when its handler is cancelled or exits.

Official source: <https://photon.codes/docs/best-practices/inbound-pipeline>
