# Advanced iMessage addresses

`im.addresses` operates on a full email address or E.164 phone number before it becomes a chat. Do not pass a chat GUID, display name, short code, or service number.

Addresses and availability results are contact data. Avoid logging the raw value, returned metadata, or Focus state unless the user-approved product flow requires it.

## Availability preflight

```ts
const address = "+15551234567";
const available = await im.addresses.isIMessageAvailable(address);
if (!available) {
  throw new Error("recipient is not currently available on iMessage");
}

const { chat } = await im.chats.create([address]);
const sent = await im.messages.sendText(chat.guid, "Hello");
```

`true` means Apple currently reports the address as reachable. It is not a guarantee that a later send will succeed because account, network, or Apple state can change.

## Address metadata

```ts
const info = await im.addresses.get(address);
console.log("address metadata resolved", {
  countryKnown: info.country !== null,
  serviceCount: info.services.length,
});
```

`country` is an ISO 3166-1 alpha-2 code or `null`. `services` can include `iMessage`, `SMS`, `RCS`, or `unknown`. Missing records throw `NotFoundError`.

Do not include `info.address` or the full metadata object in routine logs. Use a one-way token or application-owned contact ID when correlation is necessary.

## Focus state

```ts
const silenced = await im.addresses.isFocusSilenced(address);
if (silenced) {
  // Send normally first; use Notify Anyway only when the product flow warrants it.
  await im.messages.notifySilenced(chat.guid, sent.guid);
}
```

Focus state is live, temporary, and privacy-sensitive rather than a long-term preference. Avoid persisting it, exposing it to unrelated users, or automatically bypassing Focus without explicit product intent.

Official source: <https://photon.codes/docs/advanced-kits/imessage/addresses>
