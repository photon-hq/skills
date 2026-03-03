# skills

Agent skills for [Photon](https://photon.codes/spectrum)'s SDKs.

## Skills

| Skill | Package(s) | What it covers |
| :--- | :--- | :--- |
| [`imessage`](./skills/imessage/SKILL.md) | `@photon-ai/imessage-kit` · `@photon-ai/advanced-imessage-kit` | Every method, type, event, and pattern for iMessage automation — from simple bots to enterprise agents. |
| [`chat-adapter-imessage`](./skills/chat-adapter-imessage/SKILL.md) | `chat-adapter-imessage` | Connecting the Vercel AI SDK to iMessage. Local and remote modes, all adapter methods, message types, and webhook payloads. |

## Install

```bash
npx skills add photon-hq/skills --skill <skill-name>
```

**Examples:**

```bash
npx skills add photon-hq/skills --skill imessage
npx skills add photon-hq/skills --skill chat-adapter-imessage
```
