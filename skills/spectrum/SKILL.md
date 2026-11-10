---
name: spectrum
description: >
  Build or review messaging agents with Photon Spectrum (`spectrum-ts`). Use for Spectrum setup, messages and
  content, spaces and users, provider capabilities, iMessage/WhatsApp/Telegram/Terminal/Voice integrations,
  webhooks, Chat SDK or eve integrations, custom platforms, lifecycle, or production message-processing architecture.
license: MIT
metadata:
  author: photon-hq
  version: '3.1.0'
---

# Spectrum

Spectrum is Photon's unified messaging SDK. Write handler logic against one `app.messages` stream and deliver it through iMessage, WhatsApp Business, Telegram, Terminal, Voice, or a custom provider. This skill targets **[`spectrum-ts`](https://github.com/photon-hq/spectrum-ts)** 12.8.0; its code samples are TypeScript.

## Contract gate

Identify the provider and load its topic file before writing provider-specific code. A sample is complete only when every import, method, content shape, platform ID, fallback, and thrown error belongs to the installed `spectrum-ts` contract and the selected provider.

The universal method existing does not prove that every provider implements it. Read [`capability-semantics.md`](./capability-semantics.md) whenever support affects correctness. When the installed package is newer than the version documented here, inspect the installed package and the smallest relevant page from Photon's [`llms.txt`](https://photon.codes/docs/llms.txt) before completing the implementation.

## How this skill is organized

Each topic lives in its own file in this directory. Read the file relevant to the user's question.

| File | When to consult |
|---|---|
| [`getting-started.md`](./getting-started.md) | Installation, the `Spectrum()` app instance, credentials, telemetry, multi-platform setup, and the core primitives. |
| [`messages.md`](./messages.md) | Receiving messages, the `Message` shape, narrowing on `content.type`, and filtering the agent's own messages. |
| [`content.md`](./content.md) | Index of outgoing content builders and message actions. Each larger content family has a focused file under `content/`. |
| [`spaces-and-users.md`](./spaces-and-users.md) | The `Space` and `User` interfaces, typing indicators, `responding`, and creating or resolving conversations. |
| [`reactions-and-replies.md`](./reactions-and-replies.md) | Reactions, threaded replies, edits, unsend, their builders, and provider fallback behavior. |
| [`capability-semantics.md`](./capability-semantics.md) | Native support vs fallback, warn-and-skip, accepted no-op, and thrown errors. |
| [`platform-narrowing.md`](./platform-narrowing.md) | Recovering platform-specific types from generic Spectrum primitives. |
| [`webhooks.md`](./webhooks.md) | Adapting signed HTTP requests into Spectrum events and choosing SDK webhooks vs the standalone webhook service. |
| [`providers/imessage.md`](./providers/imessage.md) | iMessage cloud/local providers, line allocation, routing, quotas, and the provider-specific feature index. |
| [`providers/whatsapp-business.md`](./providers/whatsapp-business.md) | WhatsApp Business setup, 1:1 conversations, templates, and provider limitations. |
| [`providers/telegram.md`](./providers/telegram.md) | Telegram setup, conversations, files, reactions, replies, and provider metadata. |
| [`providers/terminal.md`](./providers/terminal.md) | Terminal TUI setup, interactions, attachments, reactions, replies, and slash commands. |
| [`providers/voice.md`](./providers/voice.md) | Spectrum Voice over SIP, inbound and outbound calls, routing, TLS, RTP, and troubleshooting. |
| [`providers/slack.md`](./providers/slack.md) | Supplemental guidance for the shipped Slack provider package. |
| [`integrations/chat-sdk.md`](./integrations/chat-sdk.md) | Connecting an existing Chat SDK bot to iMessage through the official adapter. |
| [`integrations/eve.md`](./integrations/eve.md) | Connecting an eve agent to Photon with the Photon channel, Vercel Connect, portable credentials, and a webhook route. |
| [`custom-events-and-lifecycle.md`](./custom-events-and-lifecycle.md) | Per-provider event streams, `app.stop()`, signal handling, and graceful shutdown. |
| [`custom-platforms.md`](./custom-platforms.md) | Authoring a provider with `definePlatform` and implementing the required platform contract. |
| [`best-practices.md`](./best-practices.md) | Production architecture patterns: inbound pipelines, recovery and state, idempotent retries, and iMessage deliverability. |

## See also

- [Spectrum documentation](https://photon.codes/docs/spectrum-ts/introduction)
- [`spectrum-ts` on GitHub](https://github.com/photon-hq/spectrum-ts)
- The `photon-cli` skill in this repository for project and Spectrum resource administration
- The `imessage` and `whatsapp-business` skills for low-level platform behavior not exposed by Spectrum
