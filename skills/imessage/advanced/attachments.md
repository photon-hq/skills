# Advanced iMessage attachments

Sending a file is a two-step operation: upload raw bytes with `im.attachments.upload(...)`, then send the returned `attachment.guid` through `im.messages`.

## Upload and send

```ts
import { readFile } from "node:fs/promises";

const uploaded = await im.attachments.upload({
  fileName: "photo.jpg",
  data: await readFile("photo.jpg"),
});

await im.messages.sendAttachment(
  chat.guid,
  uploaded.attachment.guid,
);
```

`data` must not be empty. Check the local file size before `readFile`. Keep a useful extension when possible; the server inspects bytes first and falls back to the extension. Each uploaded primary or companion file defaults to a 100 MiB limit.

## Live Photos

```ts
import { readFile } from "node:fs/promises";

const livePhoto = await im.attachments.upload({
  fileName: "live-photo.HEIC",
  data: await readFile("live-photo.HEIC"),
  companion: {
    data: await readFile("live-photo.MOV"),
  },
});

await im.messages.sendAttachment(
  chat.guid,
  livePhoto.attachment.guid,
);
```

The primary must be HEIC or HEIF. The MOV belongs in `companion.data`. Send only the primary attachment GUID.

## Metadata

```ts
const attachment = await im.attachments.get(
  uploaded.attachment.guid,
);

console.log("attachment ready", {
  guid: attachment.guid,
  mimeType: attachment.mimeType,
  totalBytes: attachment.totalBytes,
  transferState: attachment.transferState,
});
```

Important fields include `guid`, `fileName`, `mimeType`, `uti`, `totalBytes`, `transferState`, `isOutgoing`, `isHidden`, `isSticker`, `companionKind`, and `originalGuid`. Transfer state is `pending`, `transferring`, `failed`, `finished`, or `unknown`.

Do not log an untrusted filename or a full attachment object. Use fixed output paths or sanitize names before writing to disk.

## Stream downloads

Open explicit output handles before the stream, validate frame order, and close both handles in `finally`:

```ts
import {
  open,
  type FileHandle,
} from "node:fs/promises";

let primaryFile: FileHandle | undefined;
let companionFile: FileHandle | undefined;
let sawHeader = false;

try {
  for await (const frame of im.attachments.downloadStream(attachment.guid)) {
    switch (frame.type) {
      case "header":
        if (sawHeader) throw new Error("duplicate attachment header");
        sawHeader = true;
        primaryFile = await open("./attachment-primary.bin", "w");
        if (frame.companionInfo) {
          companionFile = await open("./attachment-companion.bin", "w");
        }
        break;

      case "primaryChunk":
        if (!primaryFile) {
          throw new Error("primary chunk received before header");
        }
        await primaryFile.write(frame.data);
        break;

      case "companionChunk":
        if (!companionFile) {
          throw new Error("companion chunk received without companion header");
        }
        await companionFile.write(frame.data);
        break;
    }
  }

  if (!sawHeader) throw new Error("attachment stream ended without header");
} finally {
  await Promise.allSettled([
    primaryFile?.close(),
    companionFile?.close(),
  ].filter((value): value is Promise<void> => value !== undefined));
}
```

The first frame is `header`; regular files then emit `primaryChunk`, and Live Photos can also emit `companionChunk`. Breaking out cancels the download. Missing attachments throw `NotFoundError`.

Non-ready attachments throw `ValidationError` with `ErrorCode.attachmentNotReady`; poll metadata with bounded delay and attempts until `transferState === "finished"`. Do not spin without a deadline.

For HEIC conversion, use the dedicated [`../../heif2jpeg/SKILL.md`](../../heif2jpeg/SKILL.md) skill after downloading bytes.

Official source: <https://photon.codes/docs/advanced-kits/imessage/attachments>
