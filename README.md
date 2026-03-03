# skills

Agent skills for [Photon](https://photon.codes/spectrum)'s SDKs.

## Skills

| Skill | Package(s) | What it covers |
| :--- | :--- | :--- |
| [`imessage`](./skills/imessage/SKILL.md) | `@photon-ai/imessage-kit` · `@photon-ai/advanced-imessage-kit` | Full API reference for both kits — send messages, react to events, manage groups, schedule reminders, and build production agents on Photon's infrastructure. |
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
