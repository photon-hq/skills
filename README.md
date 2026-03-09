# Skills

Agent skills for [Photon](https://photon.codes/spectrum)'s SDKs. Skills are packaged instructions that extend agent capabilities for building iMessage-powered applications.

Skills follow the [Agent Skills](https://skills.sh/) format.

## Available Skills

### imessage

Full API reference for [@photon-ai/imessage-kit](https://github.com/photon-hq/imessage-kit) and [@photon-ai/advanced-imessage-kit](https://github.com/photon-hq/advanced-imessage-kit). Covers two ways to integrate iMessage into your product: using your own local iMessage account via Apple’s public APIs, or using Photon’s managed service with additional capabilities.

**Use when:**
- Building an iMessage bot or automation
- Sending messages, files, or reactions programmatically
- Listening to real-time message events
- Managing group chats, scheduling messages, or setting reminders
- Deploying an iMessage agent to production via [photon.codes](https://photon.codes/spectrum)

**What's covered:**
- Setup and configuration for both kits
- Sending text, images, files, tapbacks, and message effects
- Real-time event listeners (`new-message`, `typing-indicator`, `participant-added`, and more)
- Group chat management (create, rename, add/remove participants)
- Message scheduling, reminders, and recurring messages
- Polls, Find My integration, FaceTime, and contact cards
- Error handling, plugins, graceful shutdown, and common pitfalls

### chat-adapter-imessage

Full reference for `chat-adapter-imessage` — the adapter that connects the [Vercel AI SDK](https://sdk.vercel.ai) to iMessage.

**Use when:**
- "Connect my AI chatbot to iMessage"
- "Build an iMessage AI assistant with the Vercel AI SDK"
- "Set up local or remote iMessage adapter"

**What's covered:**
- `createiMessageAdapter` config for local and remote modes
- All adapter methods: `postMessage`, `editMessage`, `deleteMessage`, `react`, `startGatewayListener`
- Webhook payload types and gateway event handling
- Feature matrix: which capabilities require the Photon server

## Installation

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

## Usage

Skills are automatically available once installed. The agent will use them when relevant tasks are detected.

**Examples:**

```
Build an iMessage bot that auto-replies to group messages
```

```
Send a scheduled message to a contact every morning at 9am
```

```
Connect my Next.js AI chatbot to iMessage using the Vercel AI SDK
```

## Skill Structure

Each skill contains:

- `SKILL.md` — Instructions and full API reference for the agent

## License

MIT
