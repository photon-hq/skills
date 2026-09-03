# Spectrum contacts and rich links

## Contact cards

```ts
import { contact, fromVCard, toVCard } from "spectrum-ts";

await space.send(contact({
  name: { first: "Ada", last: "Lovelace" },
  phones: [{ value: "+15551234567", type: "mobile" }],
  emails: [{ value: "ada@example.com", type: "work" }],
}));

await space.send(contact(alice, {
  org: { name: "Acme", title: "Engineer" },
}));

const parsed = fromVCard(await readFile("ada.vcf", "utf8"));
await space.send(contact(parsed));
```

Contact input supports structured names, phone numbers, emails, postal addresses, org data, URLs, birthday, note, photo, a resolved User, and provider-specific `raw` data. `toVCard()` serializes a resolved Contact.

## Rich links

```ts
import { richlink } from "spectrum-ts";
await space.send(richlink("https://example.com/article"));
```

Spectrum carries only the URL. It does **not** fetch Open Graph metadata. Each provider asks its native client to render or unfurl the URL; unsupported platforms fall back to plain text.

Official sources: <https://photon.codes/docs/spectrum-ts/content/contacts> and <https://photon.codes/docs/spectrum-ts/content/rich-links>
