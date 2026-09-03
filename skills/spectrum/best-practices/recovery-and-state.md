# Spectrum recovery and state

Use three independent recovery layers: deterministic client IDs, a persisted send cursor, and queue retries.

## Deterministic send IDs

Assign an ID when the job is created, not during each attempt:

```ts
const messages = reply.map((text, index) => ({
  text,
  clientGuid: `${jobId}-${index}`,
}));
```

If the transport accepted a send but the worker crashed before recording it, the retry reuses the same logical ID and can be deduplicated.

## Resume cursor

Persist `startIndex` after every acknowledged message. A retry begins at the first unsent item. If a crash occurs between acknowledgement and cursor persistence, the deterministic client ID is the second line of defense.

## Memory scope

Separate identity memory from conversation history:

```ts
await memory.getWorkingMemory({
  resourceId: senderAddress,
  threadId: `chat-${chatId}`,
});
```

Use one resource scope per person and one thread scope per chat. Test concurrent updates so two users cannot overwrite each other's working memory.

## Durable failure audit

Record only the operation metadata necessary to diagnose and replay a failed job:

- queue and stage name;
- job ID, attempt, and timestamps;
- project, space, and message identifiers after hashing or tokenization where practical;
- a bounded error class, code, and redacted diagnostic message;
- a protected payload pointer when replay needs the original encrypted input.

Do **not** copy raw inbound message text, user contact details, attachment names or metadata, attachment bytes, access tokens, project secrets, webhook secrets, or unbounded request bodies into `job_failures`.

Apply an explicit allowlist before insertion rather than deleting sensitive keys after serialization. Restrict table access to authorized operators, encrypt protected payloads separately, audit reads, and set a documented retention period with automatic deletion. A typical operational retention window should be measured in days, not indefinite storage, unless legal or incident-response requirements justify otherwise.

Make audit insertion fail-safe: failure to write the audit row must not replace the original application error or expose the rejected payload through fallback logging.

Official source: <https://photon.codes/docs/best-practices/recovery-and-state>
