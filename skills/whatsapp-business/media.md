# WhatsApp Business media

## Upload

```ts
import { readFile } from "node:fs/promises";

const { mediaId } = await client.media.upload({
  file: await readFile("photo.jpg"),
  mimeType: "image/jpeg",
  filename: "photo.jpg",
});
```

`file` accepts `Buffer | Uint8Array`. Check the local file size before reading it. For files that do not fit safely in memory, use an application-level streaming or upload path rather than loading the entire file and passing it to this method. Uploaded media IDs typically expire after about 30 days.

## Resolve and download inbound media

`client.media.getUrl(mediaId)` returns a short-lived Meta URL plus metadata. Enforce the known size before fetching, apply a request deadline, check the response length when present, and bound the body while reading it.

```ts
const MAX_MEDIA_BYTES = 20 * 1024 * 1024;

async function readResponseWithLimit(
  response: Response,
  maxBytes: number,
): Promise<Buffer> {
  if (!response.body) throw new Error("media response has no body");

  const chunks: Uint8Array[] = [];
  const reader = response.body.getReader();
  let received = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel("media exceeds byte limit");
        throw new Error(`media exceeds ${maxBytes} bytes`);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), received);
}

const { url, mimeType, fileSize, sha256 } =
  await client.media.getUrl(mediaId);

const declaredSize = Number(fileSize);
if (Number.isFinite(declaredSize) && declaredSize > MAX_MEDIA_BYTES) {
  throw new Error(`media exceeds ${MAX_MEDIA_BYTES} bytes`);
}

const response = await fetch(url, {
  headers: {
    Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}`,
  },
  signal: AbortSignal.timeout(15_000),
});
if (!response.ok) {
  throw new Error(`media download failed: ${response.status}`);
}

const contentLength = Number(response.headers.get("content-length"));
if (Number.isFinite(contentLength) && contentLength > MAX_MEDIA_BYTES) {
  await response.body?.cancel("media exceeds byte limit");
  throw new Error(`media exceeds ${MAX_MEDIA_BYTES} bytes`);
}

const bytes = await readResponseWithLimit(response, MAX_MEDIA_BYTES);
console.log("media downloaded", {
  mediaId,
  mimeType,
  bytes: bytes.length,
  digestAvailable: Boolean(sha256),
});
```

The Meta-signed URL is time-limited and still requires the access token in the `Authorization` header. Do not log the URL or token. Verify `sha256` using the encoding documented by the installed SDK before trusting or storing the bytes.

A declared `fileSize` or `Content-Length` is an early rejection signal, not a complete security boundary. The bounded stream reader protects against an incorrect or missing length.

## Delete

```ts
await client.media.delete(mediaId);
```

Deletion is optional if natural expiration meets the product requirement, but use it for immediate compliance or storage cleanup.

## Common MIME categories

| Category | Common types |
|---|---|
| Image | `image/jpeg`, `image/png` |
| Video | `video/mp4`, `video/3gpp` |
| Audio | `audio/aac`, `audio/mp4`, `audio/mpeg`, `audio/amr`, `audio/ogg` |
| Document | PDFs, spreadsheets, archives, and other document MIME types |
| Sticker | `image/webp` |

Meta enforces current size and format limits server-side. Do not hard-code a stale provider limit table as the only check; consult Meta's current limits for the account tier and keep a stricter application-level byte limit.

Official source: <https://photon.codes/docs/advanced-kits/whatsapp/media>
