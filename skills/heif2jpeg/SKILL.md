---
name: heif2jpeg
description: >
  Convert HEIC or HEIF image buffers to JPEG with Photon's `heif2jpeg` package. Use for iMessage HEIC attachments,
  `heifToJpeg`, JPEG quality, Buffer conversion, Node.js, Bun, Deno, prebuilt native binaries, libuv thread-pool
  behavior, source builds, invalid images, unsupported platforms, and attachment-processing safety.
license: MIT
metadata:
  author: photon-hq
  version: '1.0.0'
---

# HEIF to JPEG

Use this skill when an application needs to convert an HEIC or HEIF image — commonly an iMessage attachment — into a JPEG buffer with Photon's `heif2jpeg` package.

## Setup

```bash
npm install heif2jpeg
```

```javascript
const { heifToJpeg } = require("heif2jpeg");
const {
  readFile,
  stat,
  writeFile,
} = require("node:fs/promises");

async function main() {
  const source = "photo.heic";
  const { size } = await stat(source);
  if (size > 20 * 1024 * 1024) {
    throw new Error("input exceeds the application byte limit");
  }

  const input = await readFile(source);
  const jpeg = await heifToJpeg(input, { quality: 85 });
  await writeFile("photo.jpg", jpeg);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

CommonJS does not allow top-level `await`; wrap asynchronous work in `main()`. In an ESM module, use `import` syntax and top-level `await` only when the selected runtime and module configuration support it.

## API contract

```typescript
heifToJpeg(input: Buffer, options?: { quality?: number }): Promise<Buffer>
```

- `input` is a `Buffer` containing HEIC or HEIF bytes.
- The returned promise resolves to JPEG bytes in a `Buffer`.
- `quality` accepts `1` through `100` and defaults to `85`.
- Conversion runs in the libuv thread pool instead of blocking the JavaScript event loop.
- The installed package version determines whether a consumer should use CommonJS or ESM syntax; verify the exported shape before rewriting an existing import.

## Runtime and build support

Prebuilt binaries are available for macOS x64/arm64, Linux glibc x64/arm64, Linux musl x64/arm64, and Windows x64/arm64. The package can be used from Node.js-compatible runtimes including Bun and Deno.

Building from source requires Rust, CMake, and a C or C++ compiler. Treat an unsupported platform separately from an invalid image so the user receives the correct remediation.

## iMessage attachment procedure

When converting an inbound attachment:

1. Read or download the attachment as bytes without trusting its filename or declared MIME type alone.
2. Enforce an application-level size limit before loading or converting it.
3. Validate that the input is a supported HEIF-family image.
4. Run `heifToJpeg` with an explicit quality when output size matters.
5. Preserve the original attachment metadata separately if the application needs it.
6. Upload, store, or send the returned JPEG buffer.
7. Report invalid input, filesystem failures, conversion failures, and upload failures as different errors.

Do not write untrusted attachment names directly into filesystem paths, and do not keep large attachment buffers alive longer than the operation requires.

## See also

- [Photon HEIF to JPEG documentation](https://photon.codes/docs/utilities/heif2jpeg)
- The `imessage` skill for downloading or sending low-level iMessage attachments
- The `spectrum` skill for reading universal attachment content through Spectrum
