# skills

Agent skills collection for [Photon](https://photon.codes/spectrum)'s SDKs. Each skill is a source-accurate, exhaustive reference that enables AI agents and coding assistants to build production-grade applications using Photon's libraries.

## Skills

| Skill | Package(s) | What it covers |
| :--- | :--- | :--- |
| [`imessage`](./skills/imessage/SKILL.md) | `@photon-ai/imessage-kit` · `@photon-ai/advanced-imessage-kit` | Every method, type, event, and pattern for iMessage automation — from simple bots to enterprise agents. Covers both the free local tier and the production Photon server tier. |
| [`chat-adapter-imessage`](./skills/chat-adapter-imessage/SKILL.md) | `chat-adapter-imessage` | Connecting the Vercel AI SDK (Chat) to iMessage. Local and remote modes, all adapter methods, message types, and webhook payloads. |

## Install

```bash
npx skills add photon-hq/skills --skill <skill-name>
```

**Examples:**

```bash
# iMessage automation (Basic + Advanced Kit)
npx skills add photon-hq/skills --skill imessage

# Vercel AI SDK iMessage adapter
npx skills add photon-hq/skills --skill chat-adapter-imessage
```

Skills are installed into `.agents/skills/` in your project root and are automatically picked up by supported agents (Cursor, Claude Code, Copilot, and 25+ others).
