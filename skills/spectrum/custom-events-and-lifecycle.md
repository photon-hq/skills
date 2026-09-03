# Custom events and lifecycle

> TypeScript samples below — the per-provider event model and idempotent `stop()` behavior are language-neutral.

## Custom events

Providers can emit events beyond messages — typing, read receipts, delivery status, presence, or another provider-specific signal. Each declared event is exposed as a flat async iterable on the Spectrum app:

```ts
for await (const event of app.typing) {
  console.log(`${event.platform}: typing event received`);
}
```

The property name matches the event name declared by the provider. Streams are created lazily on first access, and later iterations share the same underlying source. Do not assume that each `for await` loop establishes a new transport subscription.

Per-provider access is also available through narrowing:

```ts
import { imessage } from "spectrum-ts/providers/imessage";

const im = imessage(app);
for await (const event of im.typing) {
  // iMessage-only typing events.
}
```

Use the merged `app.<event>` stream when one handler should receive the event from every registered provider. Use the narrowed stream when the code depends on one provider's payload or semantics.

## Fusor custom events

A Fusor-backed provider can return an incoming message record together with custom events:

```ts
import { fusorEvent } from "spectrum-ts";

return [
  messageRecord,
  fusorEvent("presence", {
    userId: update.userId,
    online: true,
  }),
];
```

A declared Fusor event becomes available as both `app.presence` and `narrowed.presence`. An undeclared event name can still be constructed by the helper, but Spectrum warns at runtime because the provider contract does not declare the stream.

Verify and parse the inbound webhook before returning either messages or custom events. Do not let an unverified delivery create application events.

## Graceful shutdown

```ts
await app.stop();
```

`stop()` is idempotent. It:

- closes the merged message stream;
- drains and disposes custom event streams;
- tears down each provider client through `lifecycle.destroyClient` when defined;
- flushes pending telemetry before completing.

Spectrum installs `SIGINT` and `SIGTERM` handlers. When a signal fires, it attempts cleanup for three seconds — exit code `0` when cleanup completes, or `1` when the timeout is exceeded.

Call `stop()` manually when embedding Spectrum in a longer-running process, in tests that create an app per case, or before reinitializing with a different provider set.

## Recovery and cursors

Provider event recovery is independent of the generic lifecycle. Persist only cursors or sequences that the selected provider documents as durable. Advance the checkpoint only after the corresponding event has been processed successfully.

Do not assume that a live-only custom event can be replayed after a disconnect. When correctness depends on replay, use a provider's documented catch-up mechanism or store the necessary state in the application.

## See also

- [Spectrum custom events and lifecycle](https://photon.codes/docs/spectrum-ts/custom-events-and-lifecycle)
- [`custom-platforms.md`](./custom-platforms.md) for declaring custom event producers
- [`best-practices.md`](./best-practices.md) for durable message processing and recovery
- [`webhooks.md`](./webhooks.md) for Fusor and request-adapter flows
