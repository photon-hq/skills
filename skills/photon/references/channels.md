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

## Per channel

Read only the file for the channel you are working on.

| Channel | Details |
| --- | --- |
| iMessage | [channels/imessage.md](channels/imessage.md) |
| SMS | [channels/sms.md](channels/sms.md) |
| WhatsApp Business | [channels/whatsapp-business.md](channels/whatsapp-business.md) |
| Telegram | [channels/telegram.md](channels/telegram.md) |
| Email | [channels/email.md](channels/email.md) |
| Voice | [channels/voice.md](channels/voice.md) |
