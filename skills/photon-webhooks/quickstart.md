# Webhook quickstart

Register a public HTTPS URL with the current Spectrum API and store the returned `standardSigningSecret` as `SPECTRUM_WEBHOOK_SECRET`. List operations do not recover signing secrets later.

The request handler must preserve the raw body, require both signature headers, reject stale timestamps, compare the HMAC in constant time, and durably record the verified event before returning `2xx`.

```ts
import { createHmac, timingSafeEqual } from "node:crypto";

type DurableQueue = {
  add(event: unknown, options: { jobId: string }): Promise<void>;
};

declare const durableQueue: DurableQueue;

const secret = process.env.SPECTRUM_WEBHOOK_SECRET;
if (!secret) throw new Error("SPECTRUM_WEBHOOK_SECRET is required");

export async function POST(request: Request): Promise<Response> {
  const raw = Buffer.from(await request.arrayBuffer());
  const timestamp = request.headers.get("x-spectrum-timestamp");
  const supplied = request.headers.get("x-spectrum-signature");
  const webhookId = request.headers.get("x-spectrum-webhook-id") ?? "unknown-webhook";

  if (!timestamp || !supplied) {
    return new Response("missing headers", { status: 400 });
  }

  const parsedTimestamp = Number(timestamp);
  const age = Math.abs(Math.floor(Date.now() / 1000) - parsedTimestamp);
  if (!Number.isInteger(parsedTimestamp) || age > 5 * 60) {
    return new Response("invalid or stale timestamp", { status: 400 });
  }

  const signed = `v0:${timestamp}:${raw.toString("utf8")}`;
  const expected = `v0=${createHmac("sha256", secret)
    .update(signed)
    .digest("hex")}`;

  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  if (
    expectedBytes.length !== suppliedBytes.length ||
    !timingSafeEqual(expectedBytes, suppliedBytes)
  ) {
    return new Response("invalid signature", { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw.toString("utf8"));
  } catch {
    return new Response("invalid JSON", { status: 400 });
  }

  const eventId =
    typeof payload?.message?.id === "string"
      ? payload.message.id
      : `${payload?.event ?? "unknown"}:${timestamp}`;

  try {
    await durableQueue.add(payload, {
      jobId: `${webhookId}:${eventId}`,
    });
  } catch {
    return new Response("durable enqueue failed", { status: 503 });
  }

  return new Response("accepted", { status: 202 });
}
```

Replace `durableQueue` with the application's queue or transactional inbox. The write must finish before acknowledgement. Use a uniqueness constraint or stable queue job ID so a repeated delivery returns `2xx` without repeating downstream side effects.

Test the endpoint with an actual Photon delivery. Also test a missing header, invalid signature, timestamp older than five minutes, duplicate delivery, malformed JSON body, and unavailable queue.

Official source: <https://photon.codes/docs/webhooks/quickstart>
