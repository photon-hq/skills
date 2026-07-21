# Legacy SDK and no-code tools

Read only the section matching the selected compatibility or tooling branch. Do not copy legacy constructors, method signatures, or raw effect IDs into Spectrum or `@photon-ai/advanced-imessage` 2.0 code.

## Legacy `@photon-ai/advanced-imessage-kit`

This HTTP + Socket.IO SDK is compatibility-only and is not recommended for new projects. Follow the [legacy reference](https://photon.codes/docs/legacy/imessage) when maintaining it, but do not copy its effects table verbatim: the Lasers row incorrectly uses `com.apple.messages.effect.CKHappyBirthdayEffect`, which is Celebration. The laser ID is `com.apple.messages.effect.CKLasersEffect`; Shooting Star is legacy-only and has no current v2 constant.

For migration, replace copied raw IDs with `MessageEffect.lasers` or `MessageEffect.celebration` from `@photon-ai/advanced-imessage` and rework the transport around the [current hosted contract](./hosted-v2.md).

## Photon Webhook

[Photon Webhook](https://github.com/photon-hq/webhook) delivers hosted iMessage events to an existing HTTP backend with HMAC signatures. Validate the signature before parsing or acting on the payload. Use an outbound SDK—normally Spectrum or the Advanced iMessage HTTP client—to reply.

## Photon MCP

[Photon MCP](https://github.com/photon-hq/mcp) exposes hosted iMessage operations as MCP tools. Use it when an MCP-compatible agent needs iMessage access without embedding an SDK. Keep credentials in the MCP server configuration rather than prompts or tool arguments.

## HTTP proxy

The [Advanced iMessage HTTP Proxy](https://github.com/photon-hq/advanced-imessage-http-proxy) exposes REST/OpenAPI and Swagger for non-TypeScript clients. Use it for curl, Python, or another language when Spectrum is not the target abstraction.

## Selection check

Before completing compatibility work, name the exact integration—legacy SDK, Webhook, MCP, or proxy—and verify that every example belongs to that branch. These tools are adjacent but not interchangeable APIs.
