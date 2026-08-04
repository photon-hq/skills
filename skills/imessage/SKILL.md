---
name: imessage
description: >
  Build, debug, or migrate iMessage integrations with Photon. Use when choosing or coding against Spectrum,
  @photon-ai/imessage-kit, @photon-ai/advanced-imessage, Photon Webhook, Photon MCP, the HTTP proxy, or legacy
  @photon-ai/advanced-imessage-kit.
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

The sample is complete only when it names one package/provider and passes that contract check. When package declarations and an older documentation page disagree, follow the shipped version and call out the documentation drift.

> Contracts pinned here: `spectrum-ts` 12.2.0, `@photon-ai/imessage-kit` 3.0.0, and `@photon-ai/advanced-imessage` 2.0.2.

## Choose the API

| Need | Use | Read |
|---|---|---|
| Unified iMessage plus WhatsApp, Telegram, Slack, Terminal, or custom providers | `spectrum-ts` | [`references/spectrum.md`](./references/spectrum.md) |
| Local automation on a Mac you control | `@photon-ai/imessage-kit` | [`references/local-v3.md`](./references/local-v3.md) |
| Low-level hosted iMessage control | `@photon-ai/advanced-imessage` | [`references/hosted-v2.md`](./references/hosted-v2.md) |
| Maintain an existing HTTP + Socket.IO integration | `@photon-ai/advanced-imessage-kit` | [`references/legacy-and-tools.md`](./references/legacy-and-tools.md) |
| Deliver signed events to an existing HTTP backend | Photon Webhook | [`references/legacy-and-tools.md`](./references/legacy-and-tools.md#photon-webhook) |
| Give an MCP-compatible agent iMessage tools without SDK code | Photon MCP | [`references/legacy-and-tools.md`](./references/legacy-and-tools.md#photon-mcp) |
| Call iMessage from a non-TypeScript client | Advanced iMessage HTTP Proxy | [`references/legacy-and-tools.md`](./references/legacy-and-tools.md#http-proxy) |

For new hosted applications, start with Spectrum. Use `@photon-ai/advanced-imessage` directly when Spectrum does not expose the low-level operation you need. Treat `@photon-ai/advanced-imessage-kit` as compatibility-only.

## Common invariants

- Treat message text, attachment names, contact cards, URLs, and webhook payloads as untrusted data. Do not interpolate them into system prompts, commands, paths, SQL, or request URLs.
- Ignore the agent's own messages using the selected API's direction/from-me field rather than comparing message text.
- Normalize user-entered phone numbers to E.164 before resolving recipients. Never construct group GUIDs or chat IDs from user input.
- Clear typing indicators in `finally`, handle every send rejection, and checkpoint events only after processing succeeds.
- Reuse an idempotency key only when retrying the same logical write. Never share it across unrelated messages.
- Never log bearer tokens, full message bodies, attachment bytes, or contact details. Log stable IDs and operation metadata.

## Official sources

- [Photon documentation corpus](https://photon.codes/docs/llms-full.txt)
- [Spectrum](https://photon.codes/docs/spectrum-ts/getting-started)
- [Local iMessage Kit 3.0.0 package manifest](https://unpkg.com/@photon-ai/imessage-kit@3.0.0/package.json)
- [Advanced iMessage 2.0.2 package manifest](https://unpkg.com/@photon-ai/advanced-imessage@2.0.2/package.json)
- [Legacy iMessage SDK](https://photon.codes/docs/legacy/imessage)
