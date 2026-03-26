# Skills

[![skills.sh](https://img.shields.io/badge/skills.sh-photon--hq%2Fskills-blue)](https://skills.sh/photon-hq/skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/photon-hq/skills)](https://github.com/photon-hq/skills)

Agent skills for [Photon](https://photon.codes/spectrum)'s SDKs, following the [Agent Skills](https://skills.sh/) format.

```bash
npx skills add photon-hq/skills --skill <skill-name>
```

---

## Skills

| Skill | Packages | Description |
| :--- | :--- | :--- |
| [`imessage`](./skills/imessage/SKILL.md) | `@photon-ai/imessage-kit` · `@photon-ai/advanced-imessage-kit` | Send and receive iMessages programmatically. Build AI agents, automations, and conversational apps — self-hosted or on Photon's production infrastructure. |
| [`chat-adapter-imessage`](./skills/chat-adapter-imessage/SKILL.md) | `chat-adapter-imessage` | Connect the [Vercel AI SDK](https://sdk.vercel.ai) to iMessage. Local and remote modes, all adapter methods, and gateway events. |
| [`buildspace-ci-cd`](./skills/buildspace-ci-cd/SKILL.md) | `photon-hq/buildspace` | Configure and troubleshoot BuildSpace reusable GitHub Actions workflows for automated releases across Rust, TypeScript, Go, and Swift. |

---

### imessage

```bash
npx skills add photon-hq/skills --skill imessage
```

Two kits, your choice of infrastructure:

- **[`@photon-ai/imessage-kit`](https://github.com/photon-hq/imessage-kit)** — Self-hosted. Runs on your Mac.
- **[`@photon-ai/advanced-imessage-kit`](https://github.com/photon-hq/advanced-imessage-kit)** — Production infrastructure by Photon. Scales to any number of phone numbers.

**Covers:** sending text, images, files, effects, tapbacks, stickers, and polls · editing and unsending messages · real-time events via WebSockets · group chat management · scheduling and reminders · Find My, FaceTime, and contacts · [Photon Webhook](https://github.com/photon-hq/webhook) for HTTP event forwarding · [Photon MCP](https://github.com/photon-hq/mcp) with 67 tools at `mcp.photon.codes` · security best practices · error handling and plugins.

### chat-adapter-imessage

```bash
npx skills add photon-hq/skills --skill chat-adapter-imessage
```

Adapter that connects the [Vercel AI SDK (Chat)](https://sdk.vercel.ai) to iMessage.

**Covers:** `createiMessageAdapter` config for local and remote modes · `postMessage`, `editMessage`, `deleteMessage`, `react`, `startGatewayListener` · webhook payload types · feature matrix for Photon server capabilities.

### buildspace-ci-cd

```bash
npx skills add photon-hq/skills --skill buildspace-ci-cd
```

Configure and debug [BuildSpace](https://github.com/photon-hq/buildspace)-powered release automation using reusable GitHub Actions workflows and blocks.

**Covers:** workflow selection by project type (Rust, TypeScript, Go, Swift) · required inputs, secrets, and permissions · label-gated release triggers · monorepo handling with topological sorting · cross-platform artifact builds · Homebrew tap and Jamf publishing · README drift detection · dry-run validation · troubleshooting.

---

## Usage

Skills are automatically picked up by supported agents once installed — Cursor, Claude Code, Copilot, OpenCode, and [25+ others](https://skills.sh/).

**Try asking your agent:**

- *Build an iMessage AI agent that auto-replies to group messages*
- *Send a scheduled message to a contact every morning at 9am*
- *Connect my Next.js AI chatbot to iMessage using the Vercel AI SDK*
- *Set up a webhook to receive iMessage events on my server*
- *Give my Claude agent access to iMessage via MCP*
- *Send an iMessage using curl from my Python script*
- *Set up BuildSpace release automation for my TypeScript monorepo*

---

## Ecosystem

| Project | Description |
| :--- | :--- |
| [Photon Webhook](https://github.com/photon-hq/webhook) | Forward iMessage events to any HTTP endpoint, signed with HMAC-SHA256 — [webhook.photon.codes](https://webhook.photon.codes/) |
| [Photon MCP](https://github.com/photon-hq/mcp) | 67 MCP tools for iMessage — [mcp.photon.codes](https://mcp.photon.codes) |
| [HTTP Proxy](https://github.com/photon-hq/advanced-imessage-http-proxy) | RESTful API for iMessage with curl access and Swagger docs — [imessage-swagger.photon.codes](https://imessage-swagger.photon.codes/swagger) |
| [Photon](https://photon.codes/spectrum) | Production iMessage infrastructure — API keys and server URLs |

## License

MIT
