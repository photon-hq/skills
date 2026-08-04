---
name: spectrum
description: >
  Build or review messaging agents with Photon Spectrum (`spectrum-ts`). Use for Spectrum setup, messages and
  content, spaces and users, provider capabilities, iMessage/WhatsApp/Terminal integrations, custom platforms,
  lifecycle, or production message-processing architecture.
license: MIT
metadata:
  author: photon-hq
  version: '2.1.0'
---

# Spectrum

Spectrum is Photon's unified messaging SDK. Write handler logic against one `app.messages` stream and deliver it through iMessage, WhatsApp Business, Terminal, or a custom provider. This skill targets **[`spectrum-ts`](https://github.com/photon-hq/spectrum-ts)** 12.2.0; its code samples are TypeScript.

## Contract gate

Identify the provider and load its topic file before writing provider-specific code. A sample is complete only when every import, method, content shape, platform ID, fallback, and thrown error belongs to `spectrum-ts` 12.2.0 and the selected provider contract. The universal method existing does not prove that every provider implements it; read [`capability-semantics.md`](./capability-semantics.md) whenever support affects correctness.

## How this skill is organized

Each topic lives in its own file in this directory. Read the file relevant to the user's question.

| File | When to consult |
|---|---|
| [`getting-started.md`](./getting-started.md) | Installation, the `Spectrum()` app instance, multi-platform setup, the four core primitives. |
| [`messages.md`](./messages.md) | Receiving messages, the `Message` shape, narrowing on `content.type`, filtering own messages. |
| [`content.md`](./content.md) | Content builders for outgoing messages: `text`, `markdown`, `attachment`, `voice`, `contact`, `richlink`, `app`, `poll`, `group`, `custom`. |
| [`spaces-and-users.md`](./spaces-and-users.md) | The `Space` interface, typing indicators, `responding`, creating DMs and groups. |
| [`reactions-and-replies.md`](./reactions-and-replies.md) | `message.react(...)`, threaded `message.reply(...)`, when to use which. |
| [`capability-semantics.md`](./capability-semantics.md) | Native support vs fallback, warn-and-skip, accepted no-op, and thrown errors. |
| [`platform-narrowing.md`](./platform-narrowing.md) | Recovering platform-specific types from generic Spectrum primitives. |
| [`providers/imessage.md`](./providers/imessage.md) | iMessage — separate cloud/local providers, shared/dedicated cloud line model, per-phone routing, message effects, tapbacks. |
| [`providers/terminal.md`](./providers/terminal.md) | Terminal TUI provider — chat sidebar, reactions, replies, attachments, slash commands. |
| [`providers/whatsapp-business.md`](./providers/whatsapp-business.md) | WhatsApp Business Cloud API. **1:1 only**. |
| [`custom-events-and-lifecycle.md`](./custom-events-and-lifecycle.md) | Per-provider event streams (`app.typing`, etc.), `app.stop()`, signal handling. |
| [`custom-platforms.md`](./custom-platforms.md) | Authoring your own provider with `definePlatform` — full field reference. |
| [`best-practices.md`](./best-practices.md) | Production architecture patterns Photon uses internally — debounce pipeline, in-flight cancellation, carry-forward, idempotent retries, per-resource memory, job-failure audit log. |

## See also

- [Spectrum docs](https://photon.codes/docs/spectrum-ts/getting-started)
- [`spectrum-ts` on GitHub](https://github.com/photon-hq/spectrum-ts)
