# SMS

Part of the Photon 2.0 skill. The overview of every channel, with costs, is in [channels.md](../channels.md).

[SMS](https://photon.codes/docs/beta/messaging/sms.md), [SMS best practices](https://photon.codes/docs/beta/best-practices/sms.md),
[Fix a rejected 10DLC campaign](https://photon.codes/docs/beta/messaging/sms/10dlc.md)

## Numbers

- Buy a US local number ($2 a month, all plans):
  `photon project platform sms purchase [--area-code 415] --idempotency-key <key> --yes --project <id> --json`
  (MCP: `purchaseSmsNumber`). It needs a payment card on file (`402 ENTITLEMENT_REQUIRED` with
  `card_required` otherwise). Ask first. Release with `photon project platform sms delete <pho_res_...> --yes`
  (also ask first; the month already paid isn't refunded).
- A new number reports `detail.activationState: "activating"` for about 15 minutes after creation, then
  `"active"`. `active` doesn't prove the carrier is ready. List owned numbers with `state=active`.
- Buying a number doesn't make it compliant: sending to US numbers needs an approved 10DLC campaign on
  that number unless every recipient is in-network, and every send needs current authorization for the
  sender and each recipient ([Send a Message](https://photon.codes/docs/beta/api-client/sdk/projects/send-message.md)).
  Without it a send answers `409 SMS_CAMPAIGN_NOT_ELIGIBLE`.
- No short codes: Photon SMS numbers can't send to or receive from them.
- General OTP filtering is off on SMS numbers, but don't use them for third-party account registration.
- WhatsApp Business registration codes sent to a Photon SMS number never appear in SMS history, the
  history API or inbound events. Don't poll for them.
- Group MMS sends are limited to eight recipients.

## 10DLC registration

US carriers accept application-to-person SMS from a local number only under a registered **brand** (who
sends) and an approved **campaign** (what they send and how people opt in). Registration belongs to the
organization; a campaign is then assigned to each number that sends.

Where: the dashboard (**Organization settings**, **Compliance**,
[10DLC registration](https://app.beta.photon.codes/organization/10dlc)) or the MCP tools
(`createTenDlcBrand`, `triggerTenDlcBrandOtp`, `listTenDlcCampaignUseCases`, `getTenDlcCampaignFees`,
`createTenDlcCampaign`, `listTenDlcCampaignReviewHistory`, `resubmitTenDlcCampaign`,
`assignSmsLineCampaign`). The CLI has no 10DLC commands, and entering a personal brand's verification code
happens on the dashboard's brand page.

Rules for an agent:

- **Never invent business details.** The legal name, EIN, address, website, use cases, opt-in flow and
  sample messages come from the user. Ask for each; don't fill gaps with plausible values.
- **Registration costs money.** Show the fees first (`getTenDlcCampaignFees`, or the
  [Billing](https://photon.codes/docs/beta/billing.md) page): a non-refundable fee per submission, charged
  again on every resubmission, and a monthly fee once carriers approve. Get a yes before creating or
  resubmitting a campaign.
- **Brand.** A business brand uses the legal company name and EIN exactly as on the IRS EIN confirmation
  letter (CP 575). A personal brand (a sole proprietor without a company tax ID) is verified by a code
  texted to the person's mobile and can have only one campaign; a name with words like LLC or Inc, or an
  EIN, needs a business brand. The website must open without a sign-in and identify the business.
  [Brand verification](https://photon.codes/docs/beta/messaging/sms/10dlc/brand-verification.md)
- **The sender must be the brand.** Each business you send messages for needs its own brand and campaign;
  one brand's campaign can't carry another business's messages.
- **Campaign.** The use cases can't change after submission. The consent text names the brand and every
  use case, the message frequency, that message and data rates may apply, and STOP to opt out and HELP for
  help; the consent checkbox is optional and unchecked by default. The opt-in form is at a public URL (or
  a public screenshot). The privacy policy says mobile information isn't sold or shared with third parties
  for marketing. Every sample message names the brand and matches a use case, and at least one tells
  people how to opt out. Guides:
  [opt-in form](https://photon.codes/docs/beta/messaging/sms/10dlc/opt-in-form.md),
  [message flow](https://photon.codes/docs/beta/messaging/sms/10dlc/message-flow.md),
  [privacy policy](https://photon.codes/docs/beta/messaging/sms/10dlc/privacy-policy.md),
  [sample messages](https://photon.codes/docs/beta/messaging/sms/10dlc/sample-messages.md),
  [use cases](https://photon.codes/docs/beta/messaging/sms/10dlc/use-cases.md),
  [prohibited content](https://photon.codes/docs/beta/messaging/sms/10dlc/prohibited-content.md).
- **Review.** A compliance review, then the carriers. A rejected campaign shows **Action required** with
  findings in its review history (`listTenDlcCampaignReviewHistory`). Fix every finding, including pages
  outside Photon, before resubmitting, because each resubmission is charged.
  [Rejection codes](https://photon.codes/docs/beta/messaging/sms/10dlc/rejection-codes.md)
- **Assign.** Once the campaign is ready, attach it to each sending number (`assignSmsLineCampaign` with the
  `campaignId`, the assignment's current `expectedVersion` from `getSmsLineCampaignAssignment`, and an
  idempotency key). Provisioning runs in the background; check it before the first send.
