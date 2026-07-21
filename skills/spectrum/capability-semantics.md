# Capability and fallback semantics

Read this before relying on reactions, replies, typing, edits, read receipts, group management, or another capability that providers may not implement.

## Send-routed operations warn and skip

Every outgoing `Content` variant flows through the provider's top-level `send` dispatcher. When that dispatcher throws `UnsupportedError`, Spectrum catches it, logs a structured warning, and resolves without a message instead of throwing to the caller.

This applies to send-routed operations such as:

- `message.react(...)` and `message.reply(...)`
- `message.edit(...)`, `message.unsend()`, and `message.read()`
- `space.rename(...)`, `space.avatar(...)`, membership changes, and leaving a space
- typing controls when a provider reports them as unsupported

Some providers deliberately accept a control as a no-op—for example, local iMessage accepts typing signals without emitting a warning. Either way, a resolved promise does not prove the recipient saw the capability. Check the provider reference when the interaction depends on it.

Content may also have a documented fallback instead of being skipped. Examples include Markdown becoming readable plain text, voice becoming a normal audio attachment, rich links becoming URLs, and iMessage effects exposing their inner content on other providers.

## Resolvers and platform-wise reads throw

Operations outside the send pipeline surface failures to the caller:

- `platform.space.create(...)` and `platform.space.get(...)`
- omitted platform-wise actions such as `getMessage`, `getMembers`, `getAvatar`, and `getDisplayName`
- provider configuration and lifecycle failures

These calls need normal error handling. A provider's own reference may add stricter preconditions, such as dedicated-line group creation or multi-line routing parameters.

## Completion check

Before completing code that uses an optional capability, identify which of these outcomes the selected provider guarantees: native support, fallback, warn-and-skip, accepted no-op, or thrown error. Do not infer support from the universal method merely existing.
