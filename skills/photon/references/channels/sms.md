# SMS

Part of the Photon 2.0 skill. The overview of every channel, with plans and what each needs, is in [channels.md](../channels.md).

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
