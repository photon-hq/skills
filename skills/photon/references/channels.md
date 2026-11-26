# Channels

What each channel on Photon 2.0 needs and what it refuses. Check the user's plan, the channel's
compliance rules and the cost before connecting anything, and ask before any purchase, assignment or
send. Docs: [Get started](https://photon.codes/docs/beta/index.md),
[Messaging](https://photon.codes/docs/beta/messaging/index.md),
[Plans](https://photon.codes/docs/beta/plans-and-billing.md).

| Channel | Status on 2.0 | Needs | Details |
| --- | --- | --- | --- |
| iMessage | Available | A shared-line assignment per person (Free, Pro) or a dedicated line (Business) | [channels/imessage.md](channels/imessage.md) |
| SMS | Available | A Photon number; US sends need an approved 10DLC campaign | [channels/sms.md](channels/sms.md) |
| WhatsApp Business | Available | A Photon SMS number or your own number, connected through Meta's signup | [channels/whatsapp-business.md](channels/whatsapp-business.md) |
| Telegram | Available | A bot the user owns; one bot per project | [channels/telegram.md](channels/telegram.md) |
| Email | Available | A domain or unused subdomain whose DNS the user controls | [channels/email.md](channels/email.md) |
| Voice | Available over SIP | A voice-capable Photon number and the user's SIP voice agent | [channels/voice.md](channels/voice.md) |
| WhatsApp (personal) | Not released yet | Don't build on it; calls answer `403 WHATSAPP_PERSONAL_NOT_AVAILABLE` | [WhatsApp](https://photon.codes/docs/beta/messaging/whatsapp.md) |
| Apple Messages for Business | Listed as available | A business approved for the channel; there is no 2.0 guide and this skill can't set it up | |

Personal WhatsApp and WhatsApp Business are separate channels: connecting one doesn't enable the other.
The docs list Slack, Discord, Signal and personal WhatsApp as coming later
([Photon](https://photon.codes/docs/beta/photon.md)). Read only the file for the channel you are
working on.

## Costs

Look the price up and say it before asking for a yes. Sources, all read-only:

- Plans and included usage: [Plans](https://photon.codes/docs/beta/plans-and-billing.md). Free has no base
  fee and 25 shared iMessage assignments per project; Pro is $25 a month with 100; Business has a $250
  monthly minimum and uses dedicated lines.
- Resources: [Billing](https://photon.codes/docs/beta/billing.md). A dedicated iMessage line is $250 per
  line per month (Business, up to 50 per project); a US local number $2 a month; a 10DLC campaign $15 a
  month from activation plus $20 per registration submission, resubmissions included and non-refundable.
- Per-message usage: SMS, MMS, US/Canada voice and email are billed per use beyond the plan's allowance.
  SMS and MMS carrier fees are charged at cost on every message, included parts too, and international
  voice minutes are always billed, outside the allowance. iMessage, WhatsApp and Telegram sends have no
  per-message fee.
- The project's own state: `photon project billing overview --project <id> --json`, or MCP
  `getBillingOverview`, `listBillingPlans`, `previewProjectChange` (what a plan change would cost), and
  `getTenDlcCampaignFees` (10DLC fees for the organization).

Prices change: when the docs and this page disagree, the docs win. Buying needs a payment card on file;
without one the call answers `402 ENTITLEMENT_REQUIRED` with `card_required`, and only the person can add
one.
