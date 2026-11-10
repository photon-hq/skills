# Features and limitations

The adapter translates Chat SDK threads and messages into current Spectrum iMessage operations. Check this matrix before depending on an optional Chat SDK capability.

| Feature | Current support |
|---|---|
| Direct messages | Yes |
| Open a direct message | Yes, through `openDM` |
| Mentions | Direct messages only |
| File uploads | Yes, for sends |
| Add reactions | Yes |
| Remove reactions | Yes, for reactions added during the current adapter session |
| Message editing | Yes |
| Message deletion / unsend | Yes, subject to iMessage's native window |
| Mark read | Yes |
| Typing indicators | Yes |
| Message effects | Yes, through `sendEffect` |
| Mini-app cards | Yes, through `sendMiniApp` |
| Voice messages | Yes, through `sendVoice` |
| Chat backgrounds | Yes, through `setBackground` |
| Modals | Limited; the first supported `Select` maps to an iMessage poll |
| Fetch one message | Yes, through `fetchMessage` |
| Message history | No |
| General thread or chat info | No |
| Streaming | No |
| Ephemeral messages | No |
| Spectrum Cloud webhooks | Yes |

## Adapter-specific features

Some iMessage features have no first-class Chat SDK slot and are exposed as adapter methods.

### Message effects

```ts
await bot.adapters.imessage.sendEffect(
  thread.id,
  "Task complete!",
  "confetti",
);
```

Use a supported full-screen or bubble effect. Effects attach to text, and an unknown effect raises a validation error.

### Mini-app cards

```ts
await bot.adapters.imessage.sendMiniApp(
  thread.id,
  "https://example.com/task/42",
);
```

The lightweight form sends a URL-backed app card. A fully specified card can provide captions, imagery, and extension metadata where the application owns an iMessage extension.

### Voice messages and backgrounds

```ts
await bot.adapters.imessage.sendVoice(thread.id, audioInput);
await bot.adapters.imessage.setBackground(thread.id, imageInput);
```

Validate file type and size before passing untrusted media. Background support and other visual operations still depend on the serving iMessage line and current provider capability.

## Poll-backed modals

The adapter maps the first supported `Select` in a modal to a native iMessage poll. A modal must use a distinct title in the same chat so vote events can be associated with the correct callback. Unsupported modal children are not converted into text inputs or additional polls.

## Conversation resolution

Direct-message threads can normally be rebuilt from their address. A group may require context learned through the current gateway session, especially when several iMessage lines are configured. Do not assume an unseen group can be cold-resolved from an arbitrary thread ID.

## Unsupported reads

`fetchMessage` retrieves one known message. It does not provide message-history pagination or general thread metadata. Treat a `NotImplementedError` from an unsupported read as a capability boundary rather than retrying it as a transport failure.

## Completion check

Before completing an integration, identify whether each requested behavior is supported directly, supported only through an adapter-specific method, limited by iMessage, or unavailable. Do not infer support merely because the generic Chat SDK interface contains a similarly named method.

See the [current adapter repository](https://github.com/photon-hq/vercel-chat-adapter-imessage) for the shipped feature contract.
