# Voice

Part of the Photon 2.0 skill. The overview of every channel, with plans and what each needs, is in [channels.md](../channels.md).

[Build a voice agent](https://photon.codes/docs/beta/get-started/voice.md),
[Cookbooks](https://photon.codes/docs/beta/cookbooks/index.md) (ElevenLabs, Retell, LiveKit, Twilio)

- Photon connects the phone network to your voice agent over SIP; the provider runs the conversation. Audio
  doesn't go through the messaging API.
- Eligible numbers: a Photon SMS number or a dedicated iMessage or WhatsApp number. Shared lines can't take
  calls.
- Routing uses Voice profiles: a project default plus optional additional profiles. Before editing any
  profile, check which one the line uses with `photon project platform voice assignment view <line-id>`, and
  edit that one. Check the default with
  `photon project platform voice profile view default`; if the project has no default yet, create it with
  `photon project platform voice profile create --default` (ask first), and keep an existing one. Then set
  the inbound SIP destination with
  `photon project platform voice profile inbound set <profile-id|default> --sip-uri <uri>` (`sips:` selects
  TLS). Editing a profile affects new calls on every line that uses it: ask first.
- Outbound calling: `photon project platform voice profile outbound enable` and `outbound rotate` print the
  SIP password once. The person runs them or uses the dashboard and puts the password in their voice
  provider; don't run them yourself or copy the password into chat or files.
- A saved destination doesn't prove a working call: verify audio both ways with a real call.
