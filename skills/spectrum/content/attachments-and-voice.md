# Spectrum attachments and voice notes

## Attachments

```ts
import { attachment } from "spectrum-ts";

await space.send(attachment("./photo.jpg"));
await space.send(attachment(new URL("https://example.com/report.pdf")));
await space.send(attachment(buffer, {
  id: "report-v2",
  name: "report.pdf",
  mimeType: "application/pdf",
}));
```

Inputs are a path, URL, or Buffer. The MIME type is inferred from a usable filename extension; when it cannot be inferred, provide `mimeType` or the builder fails at send time. Provider-originated attachments retain native IDs; outbound builders use a UUID unless `options.id` is supplied.

Resolved attachments expose `read()` and `stream()`. Prefer `stream()` for large files and enforce size limits before materializing untrusted input.

## Voice notes

```ts
import { voice } from "spectrum-ts";

await space.send(voice("./note.m4a"));
await space.send(voice(buffer, {
  name: "note.m4a",
  mimeType: "audio/mp4",
  duration: 12,
}));
```

Voice is an audio clip inside a message, not a live SIP call. Providers without voice-note support generally downgrade it to a normal audio attachment.

Official sources: <https://photon.codes/docs/spectrum-ts/content/attachments> and <https://photon.codes/docs/spectrum-ts/content/voice>
