# Chat SDK integration

Use the official scoped iMessage adapter when the application is already structured around Chat SDK. Do not manually rebuild adapter translation.

```bash
pnpm add chat @photon-ai/chat-adapter-imessage
```

```ts
import { Chat } from "chat";
import { createiMessageAdapter } from "@photon-ai/chat-adapter-imessage";

const bot = new Chat({
  userName: "my-bot",
  adapters: {
    imessage: createiMessageAdapter({
      projectId: process.env.IMESSAGE_PROJECT_ID!,
      projectSecret: process.env.IMESSAGE_PROJECT_SECRET!,
    }),
  },
});
```

The current adapter supports Spectrum Cloud and self-hosted gRPC. Local on-device mode was removed; use `@spectrum-ts/imessage-local` or `@photon-ai/imessage-kit` for local macOS access.

Load [`../../chat-adapter-imessage/SKILL.md`](../../chat-adapter-imessage/SKILL.md) for configuration, webhook and gateway receiving modes, feature translations, deployment, and troubleshooting.

## Source of truth

The generated Photon Chat SDK page currently describes an older unscoped adapter release. For the current integration contract, use the published `@photon-ai/chat-adapter-imessage` package, its exported types, tests, and repository README as the primary source. Treat the generated page as background until it is regenerated from the scoped package.

Current package source: <https://github.com/photon-hq/vercel-chat-adapter-imessage>

Generated integration page: <https://photon.codes/docs/integrations/chat-sdk>
