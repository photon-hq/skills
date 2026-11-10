# Advanced iMessage polls

Polls use two different opaque IDs:

- `pollMessageGuid` identifies the poll.
- `optionIdentifier` identifies one option.

## Create and mutate

```ts
const poll = await im.polls.create(chat.guid, "Lunch?", [
  "Pizza",
  "Sushi",
  "Burgers",
], { clientMessageId: `poll-${job.id}` });

const latest = await im.polls.get(poll.pollMessageGuid);
const voted = await im.polls.vote(
  poll.pollMessageGuid,
  latest.options[0]!.optionIdentifier,
);
const unvoted = await im.polls.unvote(poll.pollMessageGuid);
const extended = await im.polls.addOption(poll.pollMessageGuid, "Thai");
```

Titles and option text are trimmed and cannot be empty. A poll needs at least two choices. `vote(...)`, `unvote(...)`, and `addOption(...)` return the updated poll. Missing polls throw `NotFoundError`; invalid option identifiers throw `ValidationError`.

## Events

```ts
for await (const event of im.polls.subscribeEvents({
  pollMessage: poll.pollMessageGuid,
})) {
  switch (event.delta.type) {
    case "created":
    case "optionAdded":
      console.log(event.delta.options);
      break;
    case "voted":
    case "unvoted":
      console.log(event.delta.optionIdentifier);
      break;
  }
}
```

Every outer event uses `type: "poll.changed"` and includes `pollMessageGuid`, `chatGuid`, `sequence`, `isFromMe`, `occurredAt`, optional `actor`, and a discriminated `delta`. Recover missed durable poll events using `im.events.catchUp(...)`.

Official source: <https://photon.codes/docs/advanced-kits/imessage/polls>
