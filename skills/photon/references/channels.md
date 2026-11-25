# Channels

What each channel on Photon 2.0 needs and what it refuses. Check the user's plan, the channel's compliance
requirements and costs before connecting anything, and ask before any purchase, assignment or send.
Docs: [Get started](https://photon.codes/docs/beta/index.md), [Messaging](https://photon.codes/docs/beta/messaging/index.md),
[Plans](https://photon.codes/docs/beta/plans-and-billing.md).

| Channel | Status on 2.0 | Needs |
| --- | --- | --- |
| iMessage | Available | A shared-line assignment (Free, Pro) or a dedicated line (Business) |
| SMS | Available | A purchased Photon number; US sends need an approved 10DLC campaign unless all recipients are in-network |
| WhatsApp Business | Available | A Photon SMS number or your own number, connected through Photon |
| WhatsApp (personal) | Not released (internal testing as of 2026-10-22) | Don't build on it yet |
| Telegram | Available | A bot you own; one bot per project |
| Email | Available | A domain or unused subdomain whose DNS you control |
| Voice | Available over SIP | A voice-capable SMS number or dedicated iMessage or WhatsApp number, and your SIP voice agent |
| Apple Messages for Business | Listed as available | A business approved for the channel (no 2.0 guide yet) |

Slack, Discord, Signal and personal WhatsApp are listed as coming later in 2026
([Photon](https://photon.codes/docs/beta/photon.md)). Personal WhatsApp and WhatsApp Business are separate
channels: connecting one doesn't enable the other.

## iMessage

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
  - CLI: `photon project platform imessage assignment create --phone-number <E.164> --project <pho_prj_...>`.
  - API: `photon.projects.platforms.imessage.assignments.create` with `body: { handle }` (needs
    `platforms:write`). The response's `assignedPhoneNumber` is the agent's number.
- **Dedicated line** (Business, $250 per line per month, 50 per project): `photon project platform imessage
  purchase`. Provisioning can take hours. Only owners and admins can buy one. Each acquisition gets a new
  resource ID, and a released line can't be bought back for 10 days.
- A phone number and an Apple-account email are different senders even for the same person; the test sender
  must match exactly, and the message must be an iMessage, not SMS.
- Photon filters one-time passcodes on iMessage lines; don't use them for third-party sign-up or login codes.
- Photon iMessage numbers can't be registered with WhatsApp Business, through Photon or anyone else.

## SMS

[SMS](https://photon.codes/docs/beta/messaging/sms.md), [SMS best practices](https://photon.codes/docs/beta/best-practices/sms.md),
[Fix a rejected 10DLC campaign](https://photon.codes/docs/beta/messaging/sms/10dlc.md)

- Buy a US local number: `photon project platform sms purchase [--area-code 415] --idempotency-key <key>`.
  It costs money and needs a payment card on file (`ENTITLEMENT_REQUIRED` with `card_required` otherwise).
  Ask first. Release with `photon project platform sms delete <pho_res_...>` (also ask first).
- A new number reports `detail.activationState: "activating"` for about 15 minutes after creation, then
  `"active"`. `active` doesn't prove the carrier is ready. List owned numbers with `state=active`.
- Sending to US numbers needs an approved 10DLC campaign unless every recipient is in-network, and every send
  needs current Platforms authorization for the sender and each recipient
  ([Send a Message](https://photon.codes/docs/beta/api-client/sdk/projects/send-message.md)). Buying a number
  doesn't complete compliance.
- No short codes: Photon SMS numbers can't send to or receive from them.
- General OTP filtering is off on SMS numbers, but don't use them for third-party account registration.
- WhatsApp Business registration codes sent to a Photon SMS number never appear in SMS history, the history
  API or inbound events. Don't poll for them.
- Group MMS sends are limited to eight recipients.

## WhatsApp Business

[WhatsApp Business](https://photon.codes/docs/beta/messaging/whatsapp-business.md)

- Use a Photon SMS number (through Photon only, never another provider) or a number you own. Not a Photon
  iMessage number.
- Connecting a new WhatsApp Business Account runs Meta's signup in a browser, which a person must complete.
  Pick the CLI path by number source; each prints a `handoff` with the dashboard URL to pass to the person
  ([Platform resources](https://photon.codes/docs/beta/cli/projects/platform.md#automation-and-agent-flows)):
  - Your own number: `photon project platform whatsapp-business number add --source byon --no-browser --json`.
  - A Photon SMS number: `photon project platform whatsapp-business number add --source photon --new-waba
    --voip-resource-id <pho_res_...> --no-browser --json`.
- A Photon SMS number can join an already connected account without a browser:
  `photon project platform whatsapp-business number add --source photon --waba-id <id>
  --voip-resource-id <pho_res_...> --display-name <name> --idempotency-key <key> --json`, or the API
  ([Create WhatsApp VoIP sender](https://photon.codes/docs/beta/api-client/sdk/projects/platforms/create-whatsapp-voip-sender.md)).
- A number still activating answers `409 WHATSAPP_VOIP_SOURCE_ACTIVATING`; retry once it is `active`.
- Treat a verification code from the API as a secret: never log it.
- Disconnecting stops Photon from using the number; the number stays on the business account at Meta until a
  portfolio admin deletes it in WhatsApp Manager.

## Telegram

- The project sends and receives through a bot the user owns. `photon project platform telegram connect`
  prints a setup link (and a QR code in a terminal) that the person opens in Telegram to pick or create a bot.
- One bot per project: connecting another returns `409 TELEGRAM_BOT_ALREADY_CONNECTED`. Disconnect the old
  one first (ask first). Source: [changelog, November 21, 2026](https://photon.codes/docs/beta/changelog.md).
- Platform setup: [Platform resources](https://photon.codes/docs/beta/cli/projects/platform.md#connect-a-telegram-bot).

## Email

[Build an email agent](https://photon.codes/docs/beta/get-started/email.md),
[Email content and sending limits](https://photon.codes/docs/beta/messaging/email.md)

- Connect a domain: dashboard **Email** page, `photon project platform email connect <domain>`, or the API.
  Use an unused subdomain such as `mail.example.com`: changing the receiving MX of a working domain moves
  its mail. Free allows one domain per project, Pro five.
- Publish every record Photon shows: DKIM CNAMEs, bounce MX and SPF TXT (sending), and the receiving MX
  (without it, nothing arrives). Use "DNS only" for proxied CNAMEs. Wait for **Connected**.
- Addresses under the domain need no separate creation; Photon resolves one when its first email arrives.
- Bodies: `{ "type": "text", "format": "plain" | "html", "text": ... }`, or a `group` with one plain and one
  HTML part as alternatives. Markdown isn't an email format; convert it first.
- Replies: send `parentMessageId`; Photon builds the threading headers. Don't invent Message-IDs or set mail
  headers. By default a reply goes to the parent's Reply-To or From and visible To and Cc (not Bcc), so set
  explicit recipient rules before automating multi-person threads. Don't build an open autoresponder.
- New organizations may send to 50 recipients per minute and 500 per rolling 24 hours, counted per
  recipient across projects. Over that: `429 RATE_LIMITED`. Wait at least `Retry-After`, back off, and retry
  with the same `Idempotency-Key` and body; a new key or project doesn't raise the allowance.

## Voice

[Build a voice agent](https://photon.codes/docs/beta/get-started/voice.md),
[Cookbooks](https://photon.codes/docs/beta/cookbooks/index.md) (ElevenLabs, Retell, LiveKit, Twilio)

- Photon connects the phone network to your voice agent over SIP; the provider runs the conversation. Audio
  doesn't go through the messaging API.
- Eligible numbers: a Photon SMS number or a dedicated iMessage or WhatsApp number. Shared lines can't take
  calls.
- Routing uses Voice profiles: a project default plus optional additional profiles. Check with
  `photon project platform voice profile view default`; if the project has no default yet, create it with
  `photon project platform voice profile create --default` (ask first), and keep an existing one. Then set
  the inbound SIP destination with
  `photon project platform voice profile inbound set <profile-id|default> --sip-uri <uri>` (`sips:` selects
  TLS). Editing a profile affects new calls on every line that uses it: ask first.
- A saved destination doesn't prove a working call: verify audio both ways with a real call.
