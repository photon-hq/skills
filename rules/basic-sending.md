---
title: Basic Kit Sending Messages
impact: HIGH
impactDescription: Core functionality for sending text, images, and files.
tags: [basic, send, message, text, image, file]
---

## Basic Kit: Sending Messages

The `send` method is the primary way to send messages. It can handle text, images, and files, either individually or combined in a single message.

### Sending Plain Text

To send a simple text message, provide the recipient's address (phone number or email) and the message content.

```typescript
import { IMessageSDK } from "@photon-ai/imessage-kit";
const sdk = new IMessageSDK();

await sdk.send("+15551234567", "Hello from the iMessage Kit!");
```

### Sending Attachments (Images and Files)

To send attachments, pass an object as the second argument. You can provide URLs or local file paths.

**Sending Images:**

Provide an array of local paths or remote URLs to the `images` property.

```typescript
// Send a single local image
await sdk.send("+15551234567", { images: ["/path/to/your/image.jpg"] });

// Send multiple remote images
await sdk.send("+15551234567", {
    images: [
        "https://example.com/image1.png",
        "https://example.com/image2.gif",
    ],
});
```

**Sending Files:**

Provide an array of local file paths to the `files` property.

```typescript
await sdk.send("+15551234567", { files: ["/path/to/your/document.pdf"] });
```

### Sending Mixed Content

You can combine text, images, and files in a single `send` call.

```typescript
await sdk.send("+15551234567", {
    text: "Here is the quarterly report and a preview chart.",
    files: ["/path/to/report.pdf"],
    images: ["/path/to/chart.png"],
});
```

### Sending in Batches

To send a large number of messages efficiently, use the `sendBatch` method. It sends messages concurrently, respecting the `maxConcurrent` setting in the SDK configuration.

```typescript
const messages = [
    { to: "+15551112222", content: "Hi Alex, your appointment is confirmed." },
    { to: "+15553334444", content: "Hi Beth, your report is ready." },
    { to: "+15555556666", content: { text: "Hi Charlie, here is the invoice.", files: ["/invoices/charlie.pdf"] } },
];

const results = await sdk.sendBatch(messages);
console.log(results);
// [{ status: 'fulfilled', value: 'GUID1' }, ...]
```
