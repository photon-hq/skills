# Voice

Part of the Photon 2.0 skill. The overview of every channel, with costs, is in [channels.md](../channels.md).

[Build a voice agent](https://photon.codes/docs/beta/get-started/voice.md),
[Cookbooks](https://photon.codes/docs/beta/cookbooks/index.md) (ElevenLabs, Retell, LiveKit, Twilio)

- Photon connects the phone network to the user's voice agent over SIP; the provider runs the
  conversation. Audio doesn't go through the messaging API. US/Canada minutes are billed per use beyond the
  plan's allowance; international minutes are always billed
  ([Billing](https://photon.codes/docs/beta/billing.md)).
- Eligible numbers: a Photon SMS number or a dedicated iMessage or WhatsApp number. Shared lines can't
  take calls.
- Routing uses Voice profiles: a project default plus optional additional profiles. Before editing any
  profile, check which one the line uses with `photon project platform voice assignment view <line-id>`,
  and edit that one. Check the default with `photon project platform voice profile view default`; if the
  project has none yet, create it with `photon project platform voice profile create --default` (ask
  first), and keep an existing one.
- Inbound: `photon project platform voice profile inbound set <profile-id|default> --sip-uri <uri>`
  (`sips:` selects TLS). If the provider gives SIP credentials, pass `--sip-username` and the password
  through `--sip-password-file -` on stdin, never on the command line. Editing a profile affects new calls
  on every line that uses it: ask first. On a profile with assigned lines the command needs `--yes`, which
  you pass only after that yes. The hosted MCP server can't set the inbound destination.
- Outbound calling: `outbound enable <profile>` and `outbound rotate <profile>` print the SIP `password`
  once. Use the profile the line uses (from `voice assignment view`), not `default` unless that is it.
  Check the env file first (`store-secret.mjs --check --file .env.local`), then, after a yes, pipe the
  password into it, never into chat:

  ```sh
  set -o pipefail
  photon project platform voice profile outbound enable <profile-id|default> --project <id> --json \
    | node <this skill>/scripts/store-secret.mjs --field password --key PHOTON_SIP_PASSWORD --file .env.local
  ```

  If the password belongs in the voice provider's dashboard, the person copies it from that file; don't
  print it. A lost password can't be recovered, and a replay can answer `password: null`: rotate with a
  new idempotency key (ask first; [cli.md](../cli.md#recoverable-operations)).
- A saved destination doesn't prove a working call: verify audio both ways with a real call.
