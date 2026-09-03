# Advanced iMessage groups

Group operations require a group `chat.guid`. Direct chats cannot use `im.groups`.

## Operations

| Need | Current method |
|---|---|
| Rename | `im.groups.setDisplayName(chat.guid, name)` |
| Read participants | `im.groups.listParticipants(chat.guid)` |
| Add participants | `im.groups.addParticipants(chat.guid, addresses)` |
| Remove participants | `im.groups.removeParticipants(chat.guid, addresses)` |
| Set icon | `im.groups.setIcon(chat.guid, imageBytes)` |
| Get icon | `im.groups.getIcon(chat.guid)` |
| Remove icon | `im.groups.removeIcon(chat.guid)` |
| Leave | `im.groups.leave(chat.guid)` |
| Subscribe | `im.groups.subscribeEvents(filter?)` |

```ts
import { readFile } from "node:fs/promises";

await im.groups.setDisplayName(group.guid, "Launch Team");
await im.groups.addParticipants(group.guid, ["+15551234567"]);
const members = await im.groups.listParticipants(group.guid);
await im.groups.setIcon(group.guid, await readFile("group-icon.jpg"));
```

Use full email addresses or E.164 phone numbers for participant writes. Preserve returned addresses exactly. Require explicit user intent before removing someone or leaving a group.

`getIcon(...)` throws `NotFoundError` with the documented group-icon error code when no custom icon exists. Treat that as an absent optional resource, not database corruption.

## Events

`im.groups.subscribeEvents()` emits `type: "group.changed"`. Branch on `event.change.type` for the actual group mutation:

```ts
for await (const event of im.groups.subscribeEvents({ chat: group.guid })) {
  if (event.type !== "group.changed") continue;

  switch (event.change.type) {
    case "displayNameChanged":
      await updateStoredDisplayName(
        event.chatGuid,
        event.change.displayName,
      );
      break;
    case "participantAdded":
      await addStoredParticipant(
        event.chatGuid,
        event.change.participant,
      );
      break;
    case "participantRemoved":
      await removeStoredParticipant(
        event.chatGuid,
        event.change.participant,
      );
      break;
    case "participantLeft":
      await markStoredParticipantLeft(
        event.chatGuid,
        event.change.participant,
      );
      break;
    case "iconChanged":
      await refreshStoredGroupIcon(event.chatGuid);
      break;
    case "iconRemoved":
      await clearStoredGroupIcon(event.chatGuid);
      break;
  }

  await persistContiguousSequence(event.sequence);
}
```

The handler functions represent application state updates and must be idempotent by event sequence. Persist the highest **contiguous successfully processed** sequence only after the corresponding handler completes. Recover gaps with `im.events.catchUp(...)` before advancing the checkpoint.

Do not collapse every case into logging. A membership, name, icon, or leave event can change routing, authorization, and the local representation of the chat. Do not log participant addresses or group icon bytes while applying the event.

Official source: <https://photon.codes/docs/advanced-kits/imessage/groups>
