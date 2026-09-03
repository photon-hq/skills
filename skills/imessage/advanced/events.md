# Advanced iMessage events and recovery

Durable iMessage changes carry monotonically increasing `sequence` values. Use `im.events.catchUp(lastHandledSequence)` after a disconnect and consume live resource streams at the same time.

## Correct recovery order

1. Load the last contiguous successfully handled sequence from durable storage.
2. Immediately open the live message, chat, group, and poll streams you need.
3. Start `im.events.catchUp(lastHandledSequence)` concurrently.
4. Feed catch-up and live events into one bounded-concurrency queue.
5. Deduplicate by `sequence`.
6. Advance the checkpoint only after every earlier sequence has completed successfully.

Do not finish catch-up before opening live streams; that creates a gap where new events can be missed.

```ts
const catchup = im.events.catchUp(lastHandledSequence);
const liveStreams = [
  im.messages.subscribeEvents(),
  im.chats.subscribeEvents(),
  im.groups.subscribeEvents(),
  im.polls.subscribeEvents(),
];

for (const stream of liveStreams) {
  void (async () => {
    for await (const event of stream) schedule(event);
  })();
}

for await (const event of catchup) {
  if (event.type === "catchup.complete") break;
  schedule(event);
}
```

`catchUp(...)` returns `TypedEventStream<CatchUpEvent>`. Omitting the cursor replays from the beginning. The cursor must be a non-negative safe integer. The final `catchup.complete` includes `headSequence`; it does not replace your processed checkpoint.

## Stream rules

- A `TypedEventStream<T>` has one consumer. Do not consume the same instance through both `for await` and `.on(...)`.
- Derive branches with `.filter(...)`, `.map(...)`, or `.take(...)` before consumption.
- Event handling can be concurrent, but checkpoint advancement must remain contiguous.
- Save a sequence only after its handler succeeds.
- Stop checkpoint advancement when processing fails so restart begins from the last known-good sequence.
- Break or abort streams during shutdown, then call `im.close()`.

Location `watch(...)` updates and typing indicators are not durable and cannot be recovered through catch-up.

Official source: <https://photon.codes/docs/advanced-kits/imessage/events>
