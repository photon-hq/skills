# Spectrum iMessage troubleshooting

## Wrong provider or unsupported feature

- Cloud messages use `platform === "imessage"` and narrow with `imessage(...)`.
- Local messages use `platform === "local_imessage"` and narrow with `localIMessage(...)`.
- Group creation and inbound group events require a dedicated line.
- Effects, reactions, replies, edits, unsend, read, streaming, backgrounds, rename, avatar, contact-card sharing, and membership are not local-mode features.

## New line is not receiving

Cloud lines are discovered when credentials are minted and refreshed on a schedule. A newly provisioned line is invisible until renewal; restart for immediate pickup.

## Multi-line lookup fails

With two or more dedicated lines, pass `{ phone }` to `space.get()` and `space.create()` when deterministic routing is required.

## Group changes do not arrive

Shared-pool lines do not subscribe to group-event streams. Use a Business dedicated line. Calling `space.get(chatGuid)` does not enable the stream.

## Background or avatar UI appears late

Provider completion means the change was accepted. iCloud and recipient Messages state determine when the UI renders. Repeated writes are not a reliable sync fix.

## Debugging

Use `options.logLevel: "debug"` or `LOG_LEVEL=debug`. Keep tokens and project secrets out of logs. Reconcile durable state after cursor gaps through `space.getMembers()`, `space.getAvatar()`, and message lookups.

Official source: <https://photon.codes/docs/spectrum-ts/troubleshooting/imessage>
