# WhatsApp Business events

`client.events.subscribe()` returns an async iterable containing inbound messages and outbound status updates. Every event has a resumable `cursor`.

## Durable cursor handling

```ts
for await (const event of client.events.subscribe({ cursor: lastCursor })) {
  await handleEvent(event);
  lastCursor = event.cursor;
  await persist(lastCursor);
}
```

Persist the cursor only after successful processing. The stream reconnects automatically and fetches events buffered while offline.

## Narrow inbound content

```ts
if (event.type === "message") {
  switch (event.message.content.type) {
    case "text":
      console.log("text message received", event.message.id);
      break;
    case "image":
    case "video":
    case "audio":
    case "document": {
      const { url } = await client.media.getUrl(event.message.content.media.id);
      console.log("media URL resolved", event.message.id, new URL(url).host);
      break;
    }
    case "location":
      console.log("location message received", event.message.id);
      break;
    case "reaction":
      console.log("reaction received", event.message.id);
      break;
    case "interactive":
      break;
    case "order":
      console.log("order received", event.message.id);
      break;
    default:
      // Preserve forward compatibility with future content variants.
      break;
  }
}
```

Status events describe delivery progress for sent messages. Correlate them through message IDs and optional `bizOpaqueCallbackData`. Do not log full message bodies, precise locations, contact details, signed media URLs, or order contents merely to prove that an event arrived.

## Reconnection

```ts
client.events.subscribe({
  cursor: lastCursor,
  reconnect: {
    initialDelay: 500,
    maxDelay: 60_000,
    maxAttempts: 10,
    multiplier: 2,
    onReconnect: (attempt) => console.log(`reconnect ${attempt}`),
  },
});
```

Defaults are `initialDelay: 1000`, `maxDelay: 30000`, `maxAttempts: Infinity`, and `multiplier: 2`.

## Manual missed-event recovery

```ts
const { events } = await client.events.fetchMissed({
  cursor: lastCursor,
  limit: 100,
});

for (const event of events) {
  await handleEvent(event);
  lastCursor = event.cursor;
  await persist(lastCursor);
}
```

Replay in order and deduplicate by a stable event or message identifier. Advance and persist `lastCursor` after **each** successfully handled event. If processing fails, keep the previous cursor so the failed event is replayed instead of skipped. Resume the live subscription from the latest persisted cursor.

Official source: <https://photon.codes/docs/advanced-kits/whatsapp/events>
