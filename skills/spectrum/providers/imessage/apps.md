# Customized iMessage Apps

Use the universal `app()` builder for Spectrum launcher cards. Use `customizedMiniApp()` only when you own an iMessage extension and need its bundle identity and layout.

```ts
import { customizedMiniApp } from "spectrum-ts/providers/imessage";

const card = await space.send(customizedMiniApp({
  appName: "My App",
  extensionBundleId: "com.example.myapp.imessage",
  teamId: "ABCDE12345",
  url: "https://example.com/deep-link",
  live: true,
  layout: {
    caption: "Open live dashboard",
    subcaption: "Tap to continue",
  },
}));
```

`appStoreId` is optional. `live: true` requires the matching installed extension.

## Update in place

```ts
import { edit } from "spectrum-ts";

await space.send(edit(customizedMiniApp({
  appName: "My App",
  extensionBundleId: "com.example.myapp.imessage",
  teamId: "ABCDE12345",
  url: "https://example.com/status/ready",
  layout: { caption: "Ready" },
}), card));
```

Preserve the original message because it contains provider-managed `miniAppCardSession` metadata. The edit returns `undefined`. Customized apps require cloud mode; local mode throws `UnsupportedError`.

Official source: <https://photon.codes/docs/spectrum-ts/providers/imessage/messaging-features/apps>
