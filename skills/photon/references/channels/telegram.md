# Telegram

Part of the Photon 2.0 skill. The overview of every channel, with plans and what each needs, is in [channels.md](../channels.md).

- The project sends and receives through a bot the user owns. `photon project platform telegram connect`
  prints a setup link (and a QR code in a terminal) that the person opens in Telegram to pick or create a bot.
- One bot per project: connecting another returns `409 TELEGRAM_BOT_ALREADY_CONNECTED`. Disconnect the old
  one first (ask first). Source: [changelog, November 21, 2026](https://photon.codes/docs/beta/changelog.md).
- Platform setup: [Platform resources](https://photon.codes/docs/beta/cli/projects/platform.md#connect-a-telegram-bot).
