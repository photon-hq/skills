# Open-source iMessage Kit

Use `@photon-ai/imessage-kit` for local macOS-only automation.

## Requirements

- Run on macOS with the Messages database available.
- Grant Full Disk Access to the actual terminal, IDE, or service process.
- Install the package and any runtime-specific SQLite dependency documented for the chosen runtime.
- Keep the local and Advanced iMessage APIs separate.

## Operating pattern

1. Initialize the local SDK.
2. Send or query using the current package exports.
3. Start a watcher only after preventing reply loops and excluding the application’s own messages.
4. Stop watchers and close the SDK during shutdown.
5. Treat database access and message content as sensitive local data.

This kit is not a managed cloud service and should not be presented as a multi-line production replacement.

Official source: <https://photon.codes/docs/opensource/imessage-kit>
