# Telegram

Part of the Photon 2.0 skill. The overview of every channel, with plans and what each needs, is in [channels.md](../channels.md).

- The project sends and receives through a bot the user owns. The person runs
  `photon project platform telegram connect` (or uses the dashboard): it prints a setup link and a QR code
  that they open in Telegram to pick or create a bot. The link is a secret (whoever opens it can connect a
  bot), so the agent doesn't run `connect` itself; it checks progress with `photon project platform telegram list`.
- One bot per project: connecting another returns `409 TELEGRAM_BOT_ALREADY_CONNECTED`. Disconnect the old
  one first (ask first). Source: [changelog, November 21, 2026](https://photon.codes/docs/beta/changelog.md).
- Platform setup: [Platform resources](https://photon.codes/docs/beta/cli/projects/platform.md#connect-a-telegram-bot).
