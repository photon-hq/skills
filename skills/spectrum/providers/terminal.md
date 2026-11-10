# Terminal provider

> TypeScript samples below — the TUI behavior is the same regardless of agent language.

```ts
import { terminal } from "spectrum-ts/providers/terminal";
```

A full chat TUI for developing and testing agents locally. `terminal.config()` spawns the standalone [tuichat](https://github.com/photon-hq/tuichat) binary as a subprocess and drives it over JSON-RPC. The binary auto-downloads from GitHub Releases on first run. In a TTY it boots the rich UI; in a non-TTY context such as CI or piped input, it falls back to a synchronous readline loop — the same agent code works for scripted tests.

```ts
const app = await Spectrum({
  providers: [terminal.config()],
});
```

No credentials and no project configuration are required.

| Feature | How |
|---|---|
| Multiple chats | `Ctrl+N` opens a new chat; `Ctrl+J` / `Ctrl+K` switch. Each chat is its own space. |
| Reactions | Press `r` on a message; it arrives as `reaction` content. |
| Replies | Press `e`; it arrives with a `replyTo: { messageId }` extra. |
| File attachments | Drag and drop a file into the terminal. |
| Inline images | Kitty graphics protocol when supported, half-block fallback otherwise. |
| Typing indicators | `space.startTyping()` / `space.stopTyping()`. |
| Console capture | `console.log`, `info`, `warn`, `error`, and `debug` are forwarded into a pinned `__system__` chat instead of corrupting the UI. |

## Slash commands

```ts
terminal.config({
  commands: [
    { name: "/clear", description: "Clear conversation memory" },
    { name: "/whoami", description: "Print sender details" },
  ],
});
```

Names must match `/^\/[A-Za-z0-9_-]+$/`. Slash commands arrive as regular text messages with the command string as the content, so handle them in the same `app.messages` loop.

## Programmatic spaces

The default space is `chat-1`; new chats opened with `Ctrl+N` become `chat-2`, `chat-3`, and so on. To open a named space programmatically:

```ts
const t = terminal(app);
const debug = await t.space.get("debug");
await debug.send("agent online");
```

## Testing guidance

Use Terminal as the first provider while developing a multi-platform agent. It exercises the same generic message loop without external credentials or real outbound messages.

For non-TTY tests, feed one message at a time and assert the resulting output. Do not make a CI test depend on the rich interactive key bindings.

## Sources

- [Terminal setup and usage](https://photon.codes/docs/spectrum-ts/providers/terminal/setup-and-usage)
- [Terminal interactions](https://photon.codes/docs/spectrum-ts/providers/terminal/interactions)
- [tuichat](https://github.com/photon-hq/tuichat)
