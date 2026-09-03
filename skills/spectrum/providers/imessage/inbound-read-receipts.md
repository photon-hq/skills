# Inbound iMessage read receipts

Read receipts use the normal message stream in shared and dedicated cloud modes. They do not require a dedicated line.

```ts
for await (const [space, message] of app.messages) {
  if (message.content.type !== "read") continue;
  console.log(
    message.sender?.id,
    message.content.target.id,
    message.timestamp,
  );
}
```

`message.sender` is the reader; `content.target` is a message the agent sent. Receipts Apple cannot attribute are dropped. DMs are the reliable attribution case; group receipts are best effort.

Receipts can be high volume: one reader opening a chat can mark several messages read and generate a burst. Handle `read` explicitly before any default auto-reply branch.

The agent's own `message.read()` or `space.read()` calls do not echo. Receipts are durable and can replay after reconnect. Use debug logs under the iMessage read component when receipts are missing; the recipient must also have Send Read Receipts enabled.

Official source: <https://photon.codes/docs/spectrum-ts/providers/imessage/messaging-features/inbound-read-receipts>
