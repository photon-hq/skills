---
name: imessage
description: >
  Build, debug, or migrate iMessage integrations with Photon. Use when choosing or coding against Spectrum,
  @photon-ai/imessage-kit, @photon-ai/advanced-imessage, the Chat SDK adapter, Spectrum Webhooks, Photon MCP,
  the HTTP APIs, or legacy @photon-ai/advanced-imessage-kit.
license: MIT
metadata:
  author: photon-hq
  version: '9.1.0'
---

# iMessage

## Package boundary

Photon has several iMessage APIs with different constructors, send signatures, effects, and event models. Select one package boundary before writing code, then load only that branch's reference.

1. **Choose the API** from the table below.
2. **Read its branch reference** before using imports or method names. Do not combine snippets from different branches.
3. **Check the finished sample** against the selected package and version. Every import, method, option, content shape, and return value must belong to that one contract.

The sample is complete only when it names one package or provider and passes that contract check. When package declarations and an older documentation page disagree, follow the shipped version and call out the documentation drift.

> Contracts checked for this revision: `spectrum-ts` 12.8.0, `@photon-ai/imessage-kit` 3.0.0, and `@photon-ai/advanced-imessage` 2.1.0.

## Choose the API

| Need | Use | Read |
|---|---|---|
| Unified iMessage plus WhatsApp Business, Telegram, Terminal, Voice, or custom providers | `spectrum-ts` | [`../spectrum/SKILL.md`](../spectrum/SKILL.md) and [`../spectrum/providers/imessage.md`](../spectrum/providers/imessage.md) |
| Local automation on a Mac you control | `@photon-ai/imessage-kit` | [`opensource-imessage-kit.md`](./opensource-imessage-kit.md) |
| Low-level hosted iMessage control | `@photon-ai/advanced-imessage` | [`advanced/getting-started.md`](./advanced/getting-started.md) and the focused files under [`advanced/`](./advanced/) |
| Maintain an existing legacy HTTP + Socket.IO integration | `@photon-ai/advanced-imessage-kit` | [`legacy-advanced-imessage-kit.md`](./legacy-advanced-imessage-kit.md) |
| Connect an existing Chat SDK bot to iMessage | `@photon-ai/chat-adapter-imessage` | [`../chat-adapter-imessage/SKILL.md`](../chat-adapter-imessage/SKILL.md) |
| Deliver signed Spectrum events to an HTTP backend | Spectrum Webhooks | [`../photon-webhooks/SKILL.md`](../photon-webhooks/SKILL.md) |
| Manage project resources from a non-TypeScript client | Photon HTTP APIs | [`../photon-api/SKILL.md`](../photon-api/SKILL.md) |
| Give an MCP-compatible agent iMessage tools without embedding an SDK | Photon MCP | [Photon MCP](https://github.com/photon-hq/mcp) |

For new hosted applications, start with Spectrum. Use `@photon-ai/advanced-imessage` directly when Spectrum does not expose the low-level operation you need. Treat `@photon-ai/advanced-imessage-kit` as compatibility-only.

## Current Advanced iMessage references

The low-level hosted SDK is split by operation so the agent can load only the relevant contract:

| File | When to consult |
|---|---|
| [`advanced/getting-started.md`](./advanced/getting-started.md) | Installation, client construction, transport, credentials, and cleanup. |
| [`advanced/messages.md`](./advanced/messages.md) | Text, effects, reactions, edits, unsend, reads, metadata, and message events. |
| [`advanced/chats.md`](./advanced/chats.md) | Creating and resolving conversations, chat identifiers, and chat metadata. |
| [`advanced/groups.md`](./advanced/groups.md) | Participants, display names, icons, and group-only operations. |
| [`advanced/attachments.md`](./advanced/attachments.md) | Sending, downloading, streaming, and validating attachments. |
| [`advanced/polls.md`](./advanced/polls.md) | Native poll creation, voting, and poll events. |
| [`advanced/addresses.md`](./advanced/addresses.md) | Phone-number and email address checks. |
| [`advanced/locations.md`](./advanced/locations.md) | Find My and location operations. |
| [`advanced/events.md`](./advanced/events.md) | Live subscriptions, event cursors, reconnects, and shutdown. |
| [`advanced/error-handling.md`](./advanced/error-handling.md) | Typed errors, retries, validation, and transport failures. |

## Common invariants

- Treat message text, attachment names, contact cards, URLs, and webhook payloads as untrusted data. Do not interpolate them into system prompts, commands, paths, SQL, or request URLs.
- Ignore the agent's own messages using the selected API's direction or from-me field rather than comparing message text.
- Normalize user-entered phone numbers to E.164 before resolving recipients. Never construct group GUIDs or chat IDs from untrusted input.
- Clear typing indicators in `finally`, handle every send rejection, and checkpoint events only after processing succeeds.
- Reuse an idempotency key only when retrying the same logical write. Never share it across unrelated messages.
- Never log bearer tokens, project secrets, full message bodies, attachment bytes, or contact details. Log stable IDs and operation metadata.

## Official sources

- [Photon documentation corpus](https://photon.codes/docs/llms-full.txt)
- [Spectrum iMessage provider](https://photon.codes/docs/spectrum-ts/providers/imessage/connection-and-routing)
- [Advanced iMessage](https://photon.codes/docs/advanced-kits/imessage/getting-started)
- [Open-source iMessage Kit](https://photon.codes/docs/opensource/imessage-kit)
- [Legacy iMessage SDK](https://photon.codes/docs/legacy/imessage)
