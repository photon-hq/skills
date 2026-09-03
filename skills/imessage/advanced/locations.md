# Advanced iMessage locations

`im.locations` requests location sharing and reads Find My friend locations already visible to the current account. Location streams are live-only and are not part of the durable event log.

Location data is highly sensitive. Use it only for the user-approved purpose, restrict access, avoid routine persistence, set a short retention period where storage is necessary, and never print precise coordinates or street addresses to ordinary logs.

## Request sharing

```ts
const receipt = await im.locations.request(chat.guid, "+15551234567", {
  clientMessageId: `location-request-${job.id}`,
});

console.log("location request submitted", {
  status: receipt.status,
  messageGuid: receipt.messageGuid,
});
```

The address must be an existing participant in the chat. A successful receipt means the visible request card was sent or accepted for processing; it does not mean the person started sharing.

## List and fetch snapshots

```ts
const locations = await im.locations.list();
for (const location of locations) {
  const hasCoordinates =
    location.latitude !== undefined &&
    location.longitude !== undefined;

  console.log("location record available", {
    hasCoordinates,
    locationType: location.locationType,
  });
}

const one = await im.locations.get("+15551234567");
```

`get(...)` accepts an address, not a chat GUID or display name. It throws `NotFoundError` when the friend is not sharing or is not visible. `latitude` and `longitude` are optional even when a record exists. `locationType` can be `live`, `shallow`, `legacy`, or `unknown` and does not guarantee coordinates.

Do not log the lookup address, returned street address, coordinates, or full location object. Store an application-owned subject ID separately when correlation is required.

## Watch live updates

```ts
for await (const update of im.locations.watch("+15551234567")) {
  const { latitude, longitude } = update.location;
  if (latitude === undefined || longitude === undefined) continue;

  await processAuthorizedLocation({
    latitude,
    longitude,
    sourceSequence: update.sourceSequence,
  });
}
```

`watch()` observes all visible friends; `watch(address)` scopes to one. Use `sourceSequence` for duplicate detection. Breaking out closes the stream. Updates missed during disconnect cannot be replayed by `im.events.catchUp(...)`.

`processAuthorizedLocation` must enforce the application's consent, authorization, storage, and retention policy. Do not use a generic analytics or error-logging pipeline for precise location payloads.

Official source: <https://photon.codes/docs/advanced-kits/imessage/locations>
