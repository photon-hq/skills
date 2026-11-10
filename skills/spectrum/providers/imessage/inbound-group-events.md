# Inbound iMessage group events

Inbound group events require a dedicated Business line. Shared-pool lines and local iMessage do not subscribe to this stream.

| Change | Content | Actor |
|---|---|---|
| Member added | `addMember`, affected `members` | `message.sender` |
| Member removed | `removeMember`, affected `members` | `message.sender` |
| Member left | `leaveSpace` | Sender is the leaver |
| Group renamed | `rename`, new `displayName` | Sender when known |
| Icon set or cleared | `avatar` action | Sender when known |

Treat every event as at-least-once input. Deduplicate before applying state and checkpoint only after the update succeeds:

```ts
for await (const [space, message] of app.messages) {
  if (message.platform !== "imessage") continue;

  const eventKey = `${space.id}:${message.id}`;
  if (await processedEvents.has(eventKey)) continue;

  switch (message.content.type) {
    case "addMember":
      await applyMembersAdded(space.id, message.content.members);
      break;
    case "removeMember":
      await applyMembersRemoved(space.id, message.content.members);
      break;
    case "leaveSpace":
      await applyMemberLeft(space.id, message.sender?.id);
      break;
    case "rename":
      await applyDisplayName(space.id, message.content.displayName);
      break;
    case "avatar":
      await markAvatarChanged(space.id, message.content.action.kind);
      break;
    default:
      continue;
  }

  await processedEvents.add(eventKey);
}
```

Back `processedEvents` with a durable unique constraint or transactional inbox, not an in-memory set in production. The state mutation and event-key insert should commit atomically where possible.

Apple does not always record an actor. Agent-originated changes are suppressed. Dedicated-line events are durable and replayed after reconnect; after a cursor gap, reconcile with `space.getMembers()`, `space.getDisplayName()`, and `space.getAvatar()` where supported.

Do not log raw member addresses or avatar bytes while reconciling group state.

Official source: <https://photon.codes/docs/spectrum-ts/providers/imessage/messaging-features/inbound-group-events>
