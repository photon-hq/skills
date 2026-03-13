# Photon Skills

Agent skills for building iMessage AI agents and applications with [Photon](https://photon.codes/spectrum).

[![skills.sh](https://img.shields.io/badge/skills.sh-photon--hq%2Fskills-blue)](https://skills.sh/photon-hq/skills/imessage)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

## Quick Start

```bash
npx skills add photon-hq/skills --skill imessage
```

## Skills

| Skill | Packages | Description |
| :--- | :--- | :--- |
| [`imessage`](./skills/imessage/SKILL.md) | `@photon-ai/imessage-kit` · `@photon-ai/advanced-imessage-kit` | Send and receive iMessages programmatically. Build AI agents, automations, and conversational apps. Self-hosted or production infrastructure. |
| [`chat-adapter-imessage`](./skills/chat-adapter-imessage/SKILL.md) | `chat-adapter-imessage` | Connect the [Vercel AI SDK](https://sdk.vercel.ai) to iMessage. Local and remote modes, all adapter methods, and gateway events. |

## Ecosystem

Photon's iMessage ecosystem beyond the SDKs:

| Project | What it does |
| :--- | :--- |
| [Photon Webhook](https://github.com/photon-hq/webhook) | Forward iMessage events to any HTTP endpoint, signed with HMAC-SHA256. |
| [Photon MCP](https://github.com/photon-hq/mcp) | 67 MCP tools for iMessage at `mcp.photon.codes`. Give any MCP-compatible agent full iMessage access. |
| [Photon](https://photon.codes/spectrum) | Production iMessage infrastructure. Get your API key and server URL. |

## Install

```bash
npx skills add photon-hq/skills --skill <skill-name>
```

```bash
# iMessage AI agents (Self-Hosted + Advanced Kit)
npx skills add photon-hq/skills --skill imessage

# Vercel AI SDK iMessage adapter
npx skills add photon-hq/skills --skill chat-adapter-imessage
```

Skills install into your project and are automatically picked up by supported agents (Cursor, Claude Code, Copilot, OpenCode, and [25+ others](https://skills.sh/)).

## What You Can Build

```
Build an iMessage AI agent that auto-replies to group messages
```

```
Send a scheduled message to a contact every morning at 9am
```

```
Connect my Next.js AI chatbot to iMessage using the Vercel AI SDK
```

```
Set up a webhook to receive iMessage events on my server
```

```
Give my Claude agent access to iMessage via MCP
```

## License

MIT
