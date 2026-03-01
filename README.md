# Photon HQ Skills

This repository serves as a central collection of official skills for AI agents developed by the Photon HQ team. Each skill provides specialized knowledge and capabilities to help agents perform a variety of tasks more effectively.

## Available Skills

This repository is structured as a multi-skill repository. Each skill resides in its own subdirectory within the `skills/` folder.

| Skill | Description |
| :--- | :--- |
| **`imessage`** | A comprehensive guide for building iMessage applications and automations using `@photon-ai/imessage-kit` and `@photon-ai/advanced-imessage-kit`. |

## Installation

To install a specific skill from this repository, use the `skills` CLI with the `--skill` flag.

### Install the iMessage Skill

```bash
npx skills add photon-hq/skills --skill imessage
```

This command will clone the `photon-hq/skills` repository and specifically install the `imessage` skill, making it available to your AI agent.

## How It Works

The `skills` CLI is designed to support multi-skill repositories. When you use the `--skill` flag, it looks for a subdirectory with a matching name inside the `skills/` folder and installs the `SKILL.md` found there.

This structure allows us to maintain a single, organized repository for all our official skills, while allowing users to install only the ones they need.
