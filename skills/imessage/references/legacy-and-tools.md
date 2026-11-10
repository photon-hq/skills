# Legacy SDK and adjacent tools

> This path is retained for compatibility with existing links and installed copies of the Photon skills.

Read only the section matching the selected integration. These tools are adjacent but do not share constructors, credentials, event models, or message methods.

## Legacy compatibility

For an existing application on the legacy hosted SDK, use [`../legacy-advanced-imessage-kit.md`](../legacy-advanced-imessage-kit.md). Treat that package as maintenance-only and do not copy its methods into Spectrum or the current Advanced iMessage SDK.

## Spectrum Webhooks

For signed inbound HTTP delivery, use [`../../photon-webhooks/SKILL.md`](../../photon-webhooks/SKILL.md). Verify the raw request before parsing and use Spectrum or a low-level SDK for outbound replies.

## Photon MCP

[Photon MCP](https://github.com/photon-hq/mcp) exposes hosted iMessage operations as MCP tools. Use it when an MCP-compatible agent needs iMessage access without embedding an SDK. Keep credentials in the MCP configuration rather than prompts or tool arguments.

## HTTP APIs and proxy

Use [`../../photon-api/SKILL.md`](../../photon-api/SKILL.md) for current Dashboard and Spectrum management APIs. Use the [Advanced iMessage HTTP Proxy](https://github.com/photon-hq/advanced-imessage-http-proxy) when a non-TypeScript application needs the low-level iMessage transport over REST.

## Selection check

Before completing the work, name the exact integration and verify that every example belongs to that one branch. Return to [`../SKILL.md`](../SKILL.md) when the package boundary is still ambiguous.
