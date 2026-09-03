# WhatsApp Business interactive messages

Send interactive content under the `interactive` key. Prefer the typed builders and fall back to the raw shape only when the helper does not cover a current Meta capability.

## Reply buttons

```ts
import { buttons, button } from "@photon-ai/whatsapp-business";

await client.messages.send({
  to,
  interactive: buttons(
    "How would you like to continue?",
    button("confirm", "Confirm order"),
    button("reschedule", "Reschedule"),
  ),
});
```

A message supports up to three reply buttons. Taps arrive as `message.content.type === "interactive"` with `interactive.type === "button_reply"`; use `interactive.reply.id` and `.title`.

## Lists

```ts
import { list } from "@photon-ai/whatsapp-business";

const menu = list("Pick a drink", "Open menu")
  .section("Hot", [
    { id: "coffee", title: "Coffee", description: "House blend" },
    { id: "tea", title: "Tea" },
  ])
  .section("Cold", [{ id: "iced", title: "Iced coffee" }])
  .withHeader({ type: "text", text: "Menu" })
  .withFooter("Ships in 5 minutes");

await client.messages.send({ to, interactive: menu });
```

Lists support up to ten rows across sections. Taps arrive as `list_reply`.

## Products

```ts
import { product, productList } from "@photon-ai/whatsapp-business";

await client.messages.send({
  to,
  interactive: product("catalog-123", "SKU-456"),
});

const catalog = productList("catalog-123", "Spring collection")
  .section("New arrivals", ["SKU-100", "SKU-101"])
  .section("Back in stock", ["SKU-050"]);
await client.messages.send({ to, interactive: catalog });
```

Orders arrive as inbound `order` content.

## Flows

```ts
import { flow } from "@photon-ai/whatsapp-business";

await client.messages.send({
  to,
  interactive: flow({
    body: "Book an appointment",
    parameters: {
      flowId: "1234567890",
      flowToken: "flow-token",
      flowCta: "Book now",
      flowMessageVersion: "3",
      flowAction: "navigate",
      flowActionPayloadJson: JSON.stringify({ screen: "START" }),
    },
  }),
});
```

Flow submissions arrive as `nfm_reply`; parse `interactive.reply.responseJson` as untrusted input and validate the resulting object.

Official source: <https://photon.codes/docs/advanced-kits/whatsapp/interactive-messages>
