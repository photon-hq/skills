# Photon skills

[![skills.sh](https://img.shields.io/badge/skills.sh-photon--hq%2Fskills-blue)](https://skills.sh/photon-hq/skills)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-green.svg)](./LICENSE)

Agent skills for [Photon](https://photon.codes): enterprise-ready messaging infrastructure for AI agents across iMessage, WhatsApp, Telegram and SMS. The skills follow the [Agent Skills](https://skills.sh/) format and cover Photon 2.0.

```bash
npx skills add photon-hq/skills --skill photon
```

## Skills

| Skill | Covers |
| :--- | :--- |
| [`photon`](./skills/photon/SKILL.md) | Set up Photon for a project with the hosted MCP server or the `photon` CLI (`@photon-ai/cli` 3.x), then build on the Photon API at `https://api.photon.codes/v1` with its TypeScript, Python and Rust clients: projects and API keys; iMessage, SMS, WhatsApp Business, Telegram, email and voice; webhooks and the WebSocket event stream; the Chat SDK adapter; and Photon Apps. |

Skills are picked up by supported agents once installed: Claude Code, Cursor, Copilot, OpenCode and [many others](https://skills.sh/).

**Try asking your agent:**

- *Set up Photon for this project and show me my projects*
- *Build an iMessage agent that replies to every incoming message*
- *Receive Photon events on my server and verify the webhook signature*
- *Connect my Chat SDK bot to iMessage and Telegram through Photon*

## Photon 1.0

Photon 1.0 (Spectrum: `spectrum-ts`, `@photon-ai/cli@legacy`, the 1.0 iMessage SDKs) has its own skills in [photon-hq/skill-legacy](https://github.com/photon-hq/skill-legacy):

```bash
npx skills add photon-hq/skill-legacy --skill spectrum
```

The two versions use different packages, API hosts and credentials. Keep each project on one of them.

The BuildSpace skill moved to [photon-hq/buildspace](https://github.com/photon-hq/buildspace): `npx skills add photon-hq/buildspace --skill buildspace-ci-cd`.

## Documentation

- [Photon 2.0 documentation](https://photon.codes/docs/beta/photon)
- [Documentation index for agents](https://photon.codes/docs/llms.txt)

## License

Apache-2.0
