# Telegram

Part of the Photon 2.0 skill. The overview of every channel, with costs, is in [channels.md](../channels.md).

[Connect a Telegram bot](https://photon.codes/docs/beta/cli/projects/platform.md#connect-a-telegram-bot)

- The project sends and receives through a bot the user owns. Connecting starts a setup with a link that
  the person opens in Telegram to pick or create a bot and confirm the project. No per-message fee.
- **The setup link is a secret**: whoever opens it can connect a bot to the project. Give it only to the
  person, in this conversation, and never write it to a file, log, commit or shared channel.
- Two ways to connect, after the user says yes:
  - The person runs `photon project platform telegram connect --project <id>` in their own terminal (it
    shows the link as a QR code and waits), or uses the dashboard. Prefer this when they can.
  - You run `photon project platform telegram connect --no-wait --no-browser --project <id> --json` and
    pass `operation.detail.setupUrl` to the person. Without `--no-wait` the command waits for the bot and
    prints the link only on stderr. MCP: `connectTelegramBot`.
- Check progress with `photon project platform telegram list --project <id> --json` (connected bots and
  setups in progress; with `platforms:write`, a setup in progress still carries `detail.setupUrl`, so keep
  that output out of files and logs too) and `telegram view <pho_res_...>` (the bot's name, username, link and any
  `connectionIssue`). A project has one setup at a time: running `connect` again continues it and prints
  the same link. To start over, `photon project platform operation cancel <pho_opr_...> --yes`, then
  connect again.
- One bot per project: connecting another returns `409 TELEGRAM_BOT_ALREADY_CONNECTED` (`connect` asks
  first, or exits 2 with `CONFIRMATION_REQUIRED` without `--yes`). Disconnect the old one first, only with
  a yes: `photon project platform telegram disconnect <pho_res_...> --yes`. The bot stays the user's in
  Telegram.
