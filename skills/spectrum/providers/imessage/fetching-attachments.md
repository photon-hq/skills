# Fetch cloud iMessage attachments by GUID

```ts
const im = imessage(app);
const attachment = await im.getAttachment("p:0/GUID");

if (attachment) {
  console.log(attachment.name, attachment.mimeType, attachment.size);
  const bytes = await attachment.read();
}
```

The returned Attachment is lazy. Every `read()` or `stream()` call starts an independent download; cache the result when reused.

With several dedicated phones, route through the owning line:

```ts
const attachment = await im.getAttachment("p:0/GUID", "+15559999999");
```

The phone argument is optional with one line or shared-pool routing. This direct getter requires cloud mode. Local inbound attachments remain accessible through message content but `getAttachment()` throws `UnsupportedError`.

Official source: <https://photon.codes/docs/spectrum-ts/providers/imessage/messaging-features/fetching-attachments>
