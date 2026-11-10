# Skills

[![skills.sh](https://img.shields.io/badge/skills.sh-photon--hq%2Fskills-blue)](https://skills.sh/photon-hq/skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/photon-hq/skills)](https://github.com/photon-hq/skills)

Agent skills for [Photon](https://photon.codes/spectrum)'s SDKs and developer tools, following the [Agent Skills](https://skills.sh/) format.

```bash
npx skills add photon-hq/skills --skill <skill-name>
```

---

## Skills

| Skill | Packages | Description |
| :--- | :--- | :--- |
| [`imessage`](./skills/imessage/SKILL.md) | `@photon-ai/imessage-kit` · `@photon-ai/advanced-imessage` · `spectrum-ts` | Choose the correct Photon iMessage API and build against the current local, hosted, or unified contract. |
| [`chat-adapter-imessage`](./skills/chat-adapter-imessage/SKILL.md) | `@photon-ai/chat-adapter-imessage` | Connect a Chat SDK bot to iMessage through Spectrum Cloud or a self-hosted Advanced iMessage endpoint. |
| [`buildspace-ci-cd`](./skills/buildspace-ci-cd/SKILL.md) | `photon-hq/buildspace` | Configure and troubleshoot BuildSpace reusable GitHub Actions workflows for automated releases across Rust, TypeScript, Go, and Swift. |
| [`spectrum`](./skills/spectrum/SKILL.md) | `spectrum-ts` | Build one messaging agent across iMessage, WhatsApp Business, Telegram, Terminal, Voice, and custom providers. |
| [`photon-cli`](./skills/photon-cli/SKILL.md) | `@photon-ai/cli` | Authenticate, bootstrap and manage projects, handle billing, and manage Spectrum resources from the terminal. |
| [`photon-webhooks`](./skills/photon-webhooks/SKILL.md) | Spectrum Webhooks | Receive signed Spectrum events over HTTP, verify deliveries, deduplicate retries, and manage webhook registrations. |
| [`photon-api`](./skills/photon-api/SKILL.md) | Spectrum API · Dashboard API · OAuth 2.1 | Build project-management integrations over HTTPS using current OpenAPI contracts and Photon OAuth. |
| [`whatsapp-business`](./skills/whatsapp-business/SKILL.md) | `@photon-ai/whatsapp-business` | Use the low-level WhatsApp Business SDK when an application needs direct Meta behavior beyond Spectrum's unified surface. |
| [`heif2jpeg`](./skills/heif2jpeg/SKILL.md) | `heif2jpeg` | Convert HEIC or HEIF message attachments to JPEG in Node.js-compatible runtimes. |

---

### imessage

```bash
npx skills add photon-hq/skills --skill imessage
```

Choose the API that matches the application:

- **[`spectrum-ts`](https://photon.codes/docs/spectrum-ts/getting-started)** — Recommended unified API for most new messaging agents.
- **[`@photon-ai/advanced-imessage`](https://www.npmjs.com/package/@photon-ai/advanced-imessage)** — Current low-level hosted SDK with HTTP and gRPC transports.
- **[`@photon-ai/imessage-kit`](https://github.com/photon-hq/imessage-kit)** — Local automation on a Mac you control.

**Covers:** selecting one package boundary · current hosted messages, chats, groups, attachments, polls, events, addresses, and locations · local macOS access · legacy compatibility · security, retries, and error handling.

### chat-adapter-imessage

```bash
npx skills add photon-hq/skills --skill chat-adapter-imessage
```

Use the official Spectrum-backed adapter when an application is already built around [Chat SDK](https://chat-sdk.dev/).

**Covers:** Spectrum Cloud and self-hosted configuration · signed webhook delivery · gateway listeners · reactions, edits, unsend, effects, mini-app cards, voice messages, chat backgrounds, and current capability limits. Local on-device mode is not part of the current adapter.

### buildspace-ci-cd

```bash
npx skills add photon-hq/skills --skill buildspace-ci-cd
```

Configure and debug [BuildSpace](https://github.com/photon-hq/buildspace)-powered release automation using reusable GitHub Actions workflows and blocks.

**Covers:** workflow selection by project type · required inputs, secrets, and permissions · label-gated releases · monorepo ordering · cross-platform artifacts · Homebrew and Jamf publishing · README and skill drift checks · dry-run validation.

### spectrum

```bash
npx skills add photon-hq/skills --skill spectrum
```

[`spectrum-ts`](https://github.com/photon-hq/spectrum-ts) is Photon's unified messaging SDK for TypeScript. Write handler logic against one `app.messages` stream and deliver it through multiple interfaces.

**Covers:** the `Spectrum()` app instance · messages, spaces, users, and content builders · reactions, replies, edits, unsend, read state, and typing · provider capability semantics · iMessage, WhatsApp Business, Telegram, Terminal, Voice, and supplemental Slack guidance · webhooks · Chat SDK and eve integrations · custom providers · production message-processing architecture.

### photon-cli

```bash
npx skills add photon-hq/skills --skill photon-cli
```

The [`photon`](https://www.npmjs.com/package/@photon-ai/cli) CLI (alias `pho`) is a typed terminal UI for the [Photon Dashboard](https://app.photon.codes/).

**Covers:** installation and one-off runners · device authorization and CI tokens · project creation and inspection · deliberate secret rotation · billing and upgrades · Spectrum lines, users, platforms, profile, and avatar · JSON output · backend and environment resolution · end-to-end setup workflows.

### photon-webhooks

```bash
npx skills add photon-hq/skills --skill photon-webhooks
```

Spectrum Webhooks deliver signed project events to an existing HTTPS backend.

**Covers:** registration and one-time signing secrets · event envelopes · raw-body HMAC verification · timestamp freshness · at-least-once delivery · deduplication and idempotency · fast acknowledgement and queues · retries, rotation, and troubleshooting.

### photon-api

```bash
npx skills add photon-hq/skills --skill photon-api
```

Use Photon HTTP APIs for management-plane automation, generated clients, and third-party integrations that act on behalf of a user.

**Covers:** Spectrum project credentials · Dashboard bearer tokens · OAuth 2.1 and OpenID Connect · PKCE and discovery · projects, users, billing, lines, platforms, webhooks, Voice, WhatsApp Business, and Slack · rate limits, retries, and secret handling · current Dashboard and Spectrum OpenAPI documents.

### whatsapp-business

```bash
npx skills add photon-hq/skills --skill whatsapp-business
```

Use `@photon-ai/whatsapp-business` when Spectrum does not expose the low-level Meta behavior an application requires.

**Covers:** messages, media, locations, contacts, reactions, replies, and read state · interactive buttons, lists, products, and WhatsApp Flows · templates and the 24-hour window · resumable event streams · typed errors and lifecycle cleanup.

### heif2jpeg

```bash
npx skills add photon-hq/skills --skill heif2jpeg
```

Use `heif2jpeg` to convert HEIC and HEIF message attachments into JPEG buffers.

**Covers:** `heifToJpeg` · JPEG quality · Node.js, Bun, and Deno support · prebuilt native targets · libuv thread-pool behavior · source builds · validation, size limits, and iMessage attachment workflows.

---

## Usage

Skills are automatically picked up by supported agents once installed — Cursor, Claude Code, Copilot, OpenCode, and [25+ others](https://skills.sh/).

**Try asking your agent:**

- *Build an iMessage AI agent that reacts to each message and replies in-thread*
- *Build one Spectrum handler for iMessage and Telegram with a Terminal test harness*
- *Connect my Chat SDK bot to iMessage through Photon Cloud*
- *Set up a signed Spectrum webhook in a Next.js route*
- *Use Advanced iMessage to change a group icon and send a poll*
- *Send a WhatsApp Flow with the low-level WhatsApp Business SDK*
- *Build a Photon OAuth integration that lists the user's projects*
- *Convert an inbound HEIC iMessage attachment to JPEG*
- *Log in with the Photon CLI, create a Spectrum project, and verify it*
- *Diagnose one-way audio on a Spectrum Voice call*
- *Connect an eve agent to iMessage through Photon*
- *Set up BuildSpace release automation for my TypeScript monorepo*

---

## Documentation freshness

The page-to-skill ownership map lives in [`docs/photon-docs-coverage.json`](./docs/photon-docs-coverage.json). CI compares that map with Photon's live [`llms.txt`](https://photon.codes/docs/llms.txt), the current Dashboard OpenAPI document, and the current Spectrum OpenAPI tags.

The check fails when a live page has no owner, an owner file is missing, a removed page remains marked current, a skill has invalid frontmatter, a known stale API string returns, or an internal Markdown link is broken. The Chat SDK adapter also has a package-contract check because its generated documentation currently trails the published scoped package.

---

## Ecosystem

| Project | Description |
| :--- | :--- |
| [Photon Spectrum](https://photon.codes/spectrum) | Unified messaging infrastructure and SDKs for agents. |
| [Photon Webhook](https://github.com/photon-hq/webhook) | Forward hosted iMessage events to an HTTP endpoint with signed delivery. |
| [Photon MCP](https://github.com/photon-hq/mcp) | Give MCP-compatible agents direct iMessage tools without embedding an SDK. |
| [HTTP Proxy](https://github.com/photon-hq/advanced-imessage-http-proxy) | Call Advanced iMessage through REST and Swagger from non-TypeScript clients. |
| [Photon CLI](https://github.com/photon-hq/cli) | Authenticate and manage Photon projects and Spectrum resources from the terminal. |

## License

MIT
