# WhatsApp Business

Part of the Photon 2.0 skill. The overview of every channel, with costs, is in [channels.md](../channels.md).

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
- Treat a verification code from the API as a secret: never log it or show it in chat. The MCP server
  doesn't return these codes.
- No per-message fee for WhatsApp sends ([channels.md](../channels.md#costs)).
- Disconnecting stops Photon from using the number; the number stays on the business account at Meta until a
  portfolio admin deletes it in WhatsApp Manager.
