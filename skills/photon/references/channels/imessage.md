# iMessage

Part of the Photon 2.0 skill. The overview of every channel, with plans and what each needs, is in [channels.md](../channels.md).

[Build an iMessage agent](https://photon.codes/docs/beta/get-started/imessage.md),
[iMessage](https://photon.codes/docs/beta/messaging/imessage.md)

- On 2.0: text, attachments, voice messages, replies, read receipts and typing indicators. Tapbacks, polls
  and message effects are 1.0 only for now.
- **Shared line** (Free: 25 assignments per project, Pro: 100): an assignment binds one person's phone number
  or iMessage email to an agent number from the shared pool. The person must text first: a shared line can't
  send an unsolicited first message, sends only in direct conversations (no groups), and only to someone
  who has messaged it since their assignment. The assignment's `optIn.state` is `pending` until they text,
  then `received`. An assignment uses plan capacity, so ask first.
  - Dashboard: project **iMessage** page, add the sender's identity, then assign from the shared pool.
  - CLI, for a phone number: `photon project platform imessage assignment create --phone-number <E.164> --project <pho_prj_...>`.
    For an iMessage email, use the dashboard's iMessage page instead.
  - API: `photon.projects.platforms.imessage.assignments.create` with `body: { handle }` (needs
    `platforms:write`). The response's `assignedPhoneNumber` is the agent's number.
- **Dedicated line** (Business, $250 per line per month, 50 per project): `photon project platform imessage
  purchase`. Provisioning can take hours. Only owners and admins can buy one. Each acquisition gets a new
  resource ID, and a released line can't be bought back for 10 days.
- A phone number and an Apple-account email are different senders even for the same person; the test sender
  must match exactly, and the message must be an iMessage, not SMS.
- Photon filters one-time passcodes on iMessage lines; don't use them for third-party sign-up or login codes.
- Photon iMessage numbers can't be registered with WhatsApp Business, through Photon or anyone else.
