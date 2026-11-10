# Spectrum polls, groups, and custom content

## Polls

```ts
import { poll, option } from "spectrum-ts";

await space.send(poll("Lunch?", "Pizza", "Sushi", "Tacos"));
await space.send(poll("Lunch?", [option("Pizza"), option("Sushi")]));
```

Votes arrive as `poll_option` content with the selected state and associated poll.

## Visual groups

```ts
import { group, attachment } from "spectrum-ts";

await space.send(group(
  attachment("./one.jpg"),
  attachment("./two.jpg"),
));
```

Each item remains its own Message envelope but compatible providers render them as one logical unit. Groups cannot nest and cannot contain reactions. Unsupported platforms send the items sequentially.

## Custom content

```ts
import { custom } from "spectrum-ts";
await space.send(custom({ type: "card", title: "Order confirmed" }));
```

The raw object round-trips to the provider's `send` action. Wrap repeated raw shapes in product-level helpers.

Official sources: <https://photon.codes/docs/spectrum-ts/content/polls>, <https://photon.codes/docs/spectrum-ts/content/groups>, and <https://photon.codes/docs/spectrum-ts/content/custom>
