# iMessage

Part of the Photon 2.0 skill. The overview of every channel, with costs, is in [channels.md](../channels.md).
The full setup of an iMessage agent is [first-agent.md](../first-agent.md).

[Build an iMessage agent](https://photon.codes/docs/beta/get-started/imessage.md),
[iMessage](https://photon.codes/docs/beta/messaging/imessage.md)

- On 2.0: text, attachments, voice messages, replies, read receipts and typing indicators. Tapbacks, polls
  and message effects are 1.0 only for now.
- Read the project's mode with `photon project platform imessage view --project <id> --json` (MCP:
  `getProjectImessagePlatform`): `"shared"` or `"dedicated"`. Branch on it, not on the plan's name.
- **Shared line** (Free: 25 assignments per project, Pro: 100): an assignment binds one person's phone
  number or iMessage email to an agent number from the shared pool. The person must text first: a shared
  line can't send an unsolicited first message, sends only in direct conversations (no groups), and only
  to someone who has messaged it since their assignment. The assignment's `optIn.state` is `pending` until
  they text, then `received`. An assignment uses plan capacity, so ask first.
  - CLI, for a phone number: `photon project platform imessage assignment create --phone-number <E.164>
    --idempotency-key <key> --project <id> --json`. MCP: `createSharedLineAssignment`.
  - An iMessage email handle: the dashboard's iMessage page
    (https://app.beta.photon.codes/project/platforms/imessage); the CLI can't create one.
  - The response's `assignedPhoneNumber` is the agent's number for that person.
- **Dedicated line** (Business, $250 per line per month, 50 per project):
  `photon project platform imessage purchase --idempotency-key <key> --yes --project <id> --json` after an
  explicit yes. Provisioning can take hours; the command waits, and stopping the wait doesn't stop the
  purchase (`photon operation replay` resumes it). Only owners and admins can buy one. Each acquisition
  gets a new resource ID, and a released line can't be bought back for 10 days. A usable line has
  `"imessage"` in `abilities`, `state` `active` and `detail.imessageHealth.overallStatus` `available`.
- A dedicated line can start conversations ([api-and-sdks.md](../api-and-sdks.md#start-a-conversation));
  a shared line can't.
- A phone number and an Apple-account email are different senders even for the same person; the test
  sender must match exactly, and the message must be an iMessage, not SMS.
- Photon filters one-time passcodes on iMessage lines; don't use them for third-party sign-up or login
  codes.
- Photon iMessage numbers can't be registered with WhatsApp Business, through Photon or anyone else.
