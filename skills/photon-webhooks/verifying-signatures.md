# Verifying Spectrum webhook signatures

For every request:

1. Read the exact raw body before parsing JSON.
2. Require `X-Spectrum-Timestamp` and `X-Spectrum-Signature`.
3. Reject an invalid or stale timestamp before processing the body.
4. Compute `HMAC-SHA256(secret, "v0:" + timestamp + ":" + rawBody)`.
5. Prefix lowercase hex with `v0=` and compare in constant time.
6. Return `400` for malformed or stale requests, `401` for an invalid signature, and stop processing after either failure.
7. Parse and durably enqueue the verified event before returning `2xx`.

The examples use `SPECTRUM_WEBHOOK_SECRET` consistently. Replace the declared queue interface with the application's durable queue or transactional inbox implementation; do not acknowledge before that write succeeds.

## Node / Express

```ts
import express from "express";
import { createHmac, timingSafeEqual } from "node:crypto";

type DurableQueue = {
  add(event: unknown): Promise<void>;
};

declare const durableQueue: DurableQueue;

const app = express();
const secret = process.env.SPECTRUM_WEBHOOK_SECRET;
if (!secret) throw new Error("SPECTRUM_WEBHOOK_SECRET is required");

app.post(
  "/spectrum-webhook",
  express.raw({ type: "application/json", limit: "1mb" }),
  async (req, res) => {
    const raw = req.body.toString("utf8");
    const timestamp = req.header("X-Spectrum-Timestamp");
    const supplied = req.header("X-Spectrum-Signature");
    if (!timestamp || !supplied) {
      return res.status(400).send("missing headers");
    }

    const parsedTimestamp = Number(timestamp);
    const age = Math.abs(Math.floor(Date.now() / 1000) - parsedTimestamp);
    if (!Number.isInteger(parsedTimestamp) || age > 5 * 60) {
      return res.status(400).send("invalid or stale timestamp");
    }

    const expected =
      "v0=" +
      createHmac("sha256", secret)
        .update(`v0:${timestamp}:${raw}`)
        .digest("hex");

    const expectedBytes = Buffer.from(expected);
    const suppliedBytes = Buffer.from(supplied);
    if (
      expectedBytes.length !== suppliedBytes.length ||
      !timingSafeEqual(expectedBytes, suppliedBytes)
    ) {
      return res.status(401).send("bad signature");
    }

    try {
      const event: unknown = JSON.parse(raw);
      await durableQueue.add(event);
      return res.status(202).send("accepted");
    } catch {
      return res.status(503).send("durable enqueue failed");
    }
  },
);
```

Mount the raw-body middleware on this route before any global JSON parser. The queue write must be durable; an in-memory promise or fire-and-forget callback is not sufficient.

## Bun / Hono

```ts
import { createHmac, timingSafeEqual } from "node:crypto";
import { Hono } from "hono";

type DurableQueue = {
  add(event: unknown): Promise<void>;
};

declare const durableQueue: DurableQueue;

const app = new Hono();
const secret = process.env.SPECTRUM_WEBHOOK_SECRET;
if (!secret) throw new Error("SPECTRUM_WEBHOOK_SECRET is required");

app.post("/spectrum-webhook", async (c) => {
  const raw = await c.req.text();
  const timestamp = c.req.header("X-Spectrum-Timestamp");
  const supplied = c.req.header("X-Spectrum-Signature");
  if (!timestamp || !supplied) return c.text("missing headers", 400);

  const parsedTimestamp = Number(timestamp);
  const age = Math.abs(Math.floor(Date.now() / 1000) - parsedTimestamp);
  if (!Number.isInteger(parsedTimestamp) || age > 300) {
    return c.text("invalid or stale timestamp", 400);
  }

  const expected =
    "v0=" +
    createHmac("sha256", secret)
      .update(`v0:${timestamp}:${raw}`)
      .digest("hex");

  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  if (
    expectedBytes.length !== suppliedBytes.length ||
    !timingSafeEqual(expectedBytes, suppliedBytes)
  ) {
    return c.text("bad signature", 401);
  }

  try {
    await durableQueue.add(JSON.parse(raw));
    return c.text("accepted", 202);
  } catch {
    return c.text("durable enqueue failed", 503);
  }
});

export default app;
```

## Python / FastAPI

```py
import hashlib
import hmac
import json
import os
import time
from typing import Any, Protocol

from fastapi import FastAPI, Header, HTTPException, Request, Response


class DurableQueue(Protocol):
    async def add(self, event: dict[str, Any]) -> None: ...


durable_queue: DurableQueue  # Initialize with the application's durable queue.
app = FastAPI()
secret = os.environ["SPECTRUM_WEBHOOK_SECRET"].encode()


@app.post("/spectrum-webhook", status_code=202)
async def webhook(
    request: Request,
    x_spectrum_timestamp: str | None = Header(None),
    x_spectrum_signature: str | None = Header(None),
) -> Response:
    raw = await request.body()
    if not x_spectrum_timestamp or not x_spectrum_signature:
        raise HTTPException(400, "missing headers")

    try:
        timestamp = int(x_spectrum_timestamp)
    except ValueError as error:
        raise HTTPException(400, "invalid timestamp") from error

    if abs(int(time.time()) - timestamp) > 300:
        raise HTTPException(400, "stale timestamp")

    base = b"v0:" + x_spectrum_timestamp.encode() + b":" + raw
    expected = "v0=" + hmac.new(secret, base, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, x_spectrum_signature):
        raise HTTPException(401, "bad signature")

    try:
        event = json.loads(raw)
        await durable_queue.add(event)
    except Exception as error:
        raise HTTPException(503, "durable enqueue failed") from error

    return Response(status_code=202)
```

Initialize `durable_queue` from the application's queue or transactional inbox before serving requests. Do not replace it with an un-awaited background task unless another durable write already occurred.

## Go / net/http

```go
package webhooks

import (
    "context"
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "encoding/json"
    "errors"
    "io"
    "net/http"
    "strconv"
    "time"
)

type Enqueue func(context.Context, map[string]any) error

func Handler(secret []byte, enqueue Enqueue) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if len(secret) == 0 || enqueue == nil {
            http.Error(w, "server not configured", http.StatusInternalServerError)
            return
        }

        r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
        raw, err := io.ReadAll(r.Body)
        if err != nil {
            http.Error(w, "invalid body", http.StatusBadRequest)
            return
        }

        timestamp := r.Header.Get("X-Spectrum-Timestamp")
        supplied := r.Header.Get("X-Spectrum-Signature")
        if timestamp == "" || supplied == "" {
            http.Error(w, "missing headers", http.StatusBadRequest)
            return
        }

        unix, err := strconv.ParseInt(timestamp, 10, 64)
        if err != nil {
            http.Error(w, "invalid timestamp", http.StatusBadRequest)
            return
        }
        age := time.Now().Unix() - unix
        if age < 0 {
            age = -age
        }
        if age > 300 {
            http.Error(w, "stale timestamp", http.StatusBadRequest)
            return
        }

        mac := hmac.New(sha256.New, secret)
        _, _ = mac.Write([]byte("v0:" + timestamp + ":"))
        _, _ = mac.Write(raw)
        expected := "v0=" + hex.EncodeToString(mac.Sum(nil))
        if !hmac.Equal([]byte(expected), []byte(supplied)) {
            http.Error(w, "bad signature", http.StatusUnauthorized)
            return
        }

        var event map[string]any
        if err := json.Unmarshal(raw, &event); err != nil {
            http.Error(w, "invalid JSON", http.StatusBadRequest)
            return
        }
        if err := enqueue(r.Context(), event); err != nil {
            if errors.Is(err, context.Canceled) {
                http.Error(w, "request canceled", http.StatusServiceUnavailable)
                return
            }
            http.Error(w, "durable enqueue failed", http.StatusServiceUnavailable)
            return
        }

        w.WriteHeader(http.StatusAccepted)
    }
}
```

Pass `[]byte(os.Getenv("SPECTRUM_WEBHOOK_SECRET"))` and the application's durable enqueue function when registering the handler. The signature string is 67 characters: `v0=` plus 64 lowercase hex characters.

## Rotation overlap

When the standard signing secret is rotated, the API returns `previousValidUntil`. During that overlap window, compute the expected signature with the new secret and, if it does not match, try the previous secret. Remove the previous secret after the deadline. Never accept an unlimited list of historical secrets.

Do not log either secret, the supplied signature, or an unredacted payload. Do not use parsed and re-serialized JSON as the signing input.

Official source: <https://photon.codes/docs/webhooks/verifying-signatures>
