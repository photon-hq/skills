# WhatsApp Business templates

Outside the 24-hour customer-service window, send a Meta-approved template. A template name, language, component order, and button index must match the version approved for the target WhatsApp Business account.

## Immutable builder

```ts
import {
  template,
  text,
  image,
  payload,
} from "@photon-ai/whatsapp-business";

const msg = template("promo_launch", "en_US")
  .header(text("Spring sale"))
  .body(text("Alice"), text("30%"))
  .button(0, payload("apply_code"))
  .urlButton(1, text("spring-30"));

await client.messages.send({ to, template: msg });
```

Parameter helpers:

| Helper | Use |
|---|---|
| `text(value)` | Body, header, or dynamic URL text. |
| `image(media)` | Image header. |
| `video(media)` | Video header. |
| `document(media)` | Document header. |
| `location(value)` | Location header. |
| `payload(value)` | Quick-reply button payload. |
| `couponCode(value)` | Coupon-code button. |
| `actionJson(value)` | Catalog or Flow action JSON. |

`button(index, ...)` targets a quick-reply button. `urlButton(index, text(...))` appends text to the approved base URL. Indexes correspond to the approved template definition.

## Carousel templates

```ts
const carousel = template("weekly_picks", "en_US")
  .body(text("Alice"))
  .carousel([
    {
      cardIndex: 0,
      components: [
        { type: "header", parameters: [{ type: "image", image: { id: card1Id } }] },
        { type: "body", parameters: [{ type: "text", text: "Item 1" }] },
      ],
    },
  ]);
```

## Raw input

The builder produces the same wire shape accepted directly:

```ts
await client.messages.send({
  to,
  template: {
    name: "order_confirmation",
    languageCode: "en_US",
    components: [{
      type: "body",
      parameters: [
        { type: "text", text: "Alice" },
        { type: "text", text: "#A42" },
      ],
    }],
  },
});
```

Do not silently switch to a template when a free-form send fails unless the product has selected the exact approved template and supplied all required parameters.

Official source: <https://photon.codes/docs/advanced-kits/whatsapp/templates>
