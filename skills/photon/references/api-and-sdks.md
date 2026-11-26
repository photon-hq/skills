# Photon API and clients

REST over JSON at `https://api.photon.codes`, every endpoint under `/v1`. The clients are generated from
the public OpenAPI contract (https://api.photon.codes/openapi.json) and live in
https://github.com/photon-hq/api. Docs: [API reference](https://photon.codes/docs/beta/api-reference/index.md),
[API clients](https://photon.codes/docs/beta/api-client/index.md).

The TypeScript samples here type-check in strict mode against `@photon-ai/api` 0.8.0; the Python and Rust
samples follow the 0.8.0 clients. Use only methods and fields shown in the docs or in each client's types;
every endpoint page under `api-client/sdk/` shows the call in TypeScript, Python, Rust and Go.

## Contents

- Packages
- Credentials and the version header
- First request: list an organization's projects
- How calls are shaped
- Reply to a message
- Start a conversation
- Attachments, reactions, edits, typing and read receipts
- Message status
- Pagination
- Errors
- Retries, timeouts and idempotency
- Raw HTTP
- Acting for a person with OAuth

## Packages

| Language | Install | Import | Needs |
| --- | --- | --- | --- |
| TypeScript | `npm install @photon-ai/api` | `import { Photon } from "@photon-ai/api"` (ES module) | Node.js 22+ |
| Python | `pip install photonhq-api` | `from photon_api import Photon` (also `AsyncPhoton`) | Python 3.11+ |
| Rust | `cargo add photonhq-api`, `cargo add reqwest@0.13 --no-default-features` (for `HeaderMap`) and `cargo add tokio --features macros,rt-multi-thread` | `use photon_ai_api::...` | Rust 1.88+, Tokio |
| Go | `go get github.com/photon-hq/api/packages/go` | `photonapi` | Go 1.25+ |

All four share one version number. Below 1.0, a minor release can break code, so pin one minor version
(npm's default `^0.x.y`, pip `photonhq-api~=0.x.y`, Cargo's default `0.x.y`) and check the current one
with `npm view @photon-ai/api version`
([Versioning](https://photon.codes/docs/beta/api-client/versioning.md)). The docs' walkthroughs may pin an
older version; read the [changelog](https://photon.codes/docs/beta/changelog.md) for breaking changes.

## Credentials and the version header

[Credentials](https://photon.codes/docs/beta/api-client/credentials.md),
[API contract versioning](https://photon.codes/docs/beta/api-client/api-versioning.md)

- Every credential goes in `Authorization: Bearer <credential>`. Use the narrowest one: a project API key
  (`pho_sk_...`) works only under `/v1/projects/{projectId}` for its own project; organization and account
  endpoints (such as listing projects) need an account service key (`pho_ask_...`), a service identity
  credential, or an OAuth token.
- Send `Photon-Version: 2026-07-01` on every request. The clients don't send it by default, so set it as a
  client-wide header. A request without it can fail with `400 INVALID_API_VERSION`.
- Rust checks each operation's accepted credentials before sending. Register the key under its scheme
  name: `"projectApiKey"`, `"accountServiceKey"`, `"serviceIdentityBearer"` or `"oauth2"`. A header set by
  hand doesn't count. Send `Photon-Version` with a `reqwest` `HeaderMap` passed to
  `PhotonClientBuilder::static_headers`.
- The clients don't run OAuth flows. For a token that refreshes, pass a function as `headers` (TypeScript,
  Python) or a `Credential::Provider` (Rust).
- Keys stay on servers, read from the environment, never in source, config files, browser or mobile code.

## First request: list an organization's projects

Needs `PHOTON_API_KEY` set to an account service key (or service identity credential) and
`PHOTON_ORGANIZATION_ID` ([Making requests](https://photon.codes/docs/beta/api-client/making-requests.md)).

```typescript
import { Photon } from "@photon-ai/api";

const apiKey = process.env.PHOTON_API_KEY;
const organizationId = process.env.PHOTON_ORGANIZATION_ID;
if (!apiKey || !organizationId) {
  throw new Error("Set PHOTON_API_KEY and PHOTON_ORGANIZATION_ID");
}

const photon = new Photon({
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Photon-Version": "2026-07-01",
  },
});

const page = await photon.organizations.projects.list({
  path: { organizationId },
  query: { pageSize: 10 },
});
for (const project of page.projects) {
  console.log(project.projectId, project.name);
}
```

```python
import os

from photon_api import Photon
from photon_api.rpc_generated import ListProjectsInput

with Photon(
    headers={
        "Authorization": f"Bearer {os.environ['PHOTON_API_KEY']}",
        "Photon-Version": "2026-07-01",
    }
) as photon:
    page = photon.organizations.projects.list(
        ListProjectsInput.model_validate(
            {
                "path": {"organizationId": os.environ["PHOTON_ORGANIZATION_ID"]},
                "query": {"pageSize": 10},
            }
        )
    )
    for project in page.projects:
        print(project.projectId, project.name)
```

```rust
use photon_ai_api::{Credential, ListProjectsParams, PhotonClientBuilder, SecretString};
use reqwest::header::{HeaderMap, HeaderValue};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let api_key = std::env::var("PHOTON_API_KEY")?;
    let organization_id = std::env::var("PHOTON_ORGANIZATION_ID")?;

    let mut headers = HeaderMap::new();
    headers.insert("Photon-Version", HeaderValue::from_static("2026-07-01"));

    let credential = Credential::Bearer(SecretString::from(api_key));
    let client = PhotonClientBuilder::new()
        .static_headers(headers)
        .credential("accountServiceKey", credential)
        .build()?;

    let page = client
        .list_projects(
            organization_id,
            Some(ListProjectsParams::default().page_size(10)),
        )
        .await
        .map_err(|error| format!("{error:?}"))?
        .into_inner();
    for project in page.projects {
        println!("{} {}", project.project_id, project.name);
    }
    Ok(())
}
```

## How calls are shaped

- **TypeScript**: namespaces follow the API paths (`photon.organizations.projects.list`,
  `photon.projects.get`, `photon.projects.sendMessage`). One argument with `path`, `query`, `headers` and
  `body`; names are the contract's camelCase. Where the contract spells a header `Idempotency-Key`, write
  `idempotencyKey`; other headers keep the contract's spelling, such as `"idempotency-key"` on
  `sendMessage`. A second argument takes `{ signal, headers }` for one call.
- **Python**: snake_case methods (`photon.projects.send_message`) taking one input model from
  `photon_api.rpc_generated`, named after the operation (`ListProjectsInput`, `SendMessageInput`), built
  with `model_validate` from a dict using the contract's names. A missing optional field is `MISSING`,
  which is truthy: test `isinstance(page.nextPageToken, str)`.
- **Rust**: `client.<operation_in_snake_case>`; path parameters, required headers and the body are
  positional (order on https://docs.rs/photonhq-api/latest/photon_ai_api/); optional parameters go in
  `<Operation>Params`. Results are `Result<ResponseValue<T>, Error<E>>`; `into_inner()` gives the body.
- Results are unions by `platform` (and messages also by `status`): check `platform` before reading
  platform-specific fields, as the samples below do.

## Reply to a message

[Send a Message](https://photon.codes/docs/beta/api-client/sdk/projects/send-message.md),
[Build an iMessage agent](https://photon.codes/docs/beta/get-started/imessage.md)

- An **Agent User** (`pho_usr_...`) is the number, address or bot the project sends from; a **Space**
  (`pho_spc_...`) is a conversation. A received message names the agent in `receivedBy`.
- `sendMessage` (`POST /v1/projects/{id}/messages`) needs `project:write` and an `idempotency-key`. A `202`
  means accepted for asynchronous delivery, not arrived ([Message status](#message-status)).
- To reply, reuse the incoming message: `space.id` as `spaceId`, `receivedBy.id` as `senderId`, its `id`
  as `parentMessageId`, and a stable key such as `reply:<incoming message id>`, kept across retries.
- Channel rules still apply: a shared iMessage line sends only in direct Spaces to a person who has
  messaged it since their assignment; SMS needs current authorization and, for US numbers, an approved
  10DLC campaign unless every recipient is in-network ([channels/sms.md](channels/sms.md)).

TypeScript, with a project API key holding `project:read` and `project:write`:

```typescript
import { ApiError, Photon } from "@photon-ai/api";

const apiKey = process.env.PHOTON_API_KEY; // project API key, pho_sk_...
const projectId = process.env.PHOTON_PROJECT_ID; // pho_prj_...
if (!apiKey || !projectId) throw new Error("Set PHOTON_API_KEY and PHOTON_PROJECT_ID");

const photon = new Photon({
  headers: { Authorization: `Bearer ${apiKey}`, "Photon-Version": "2026-07-01" },
});

type Message = Awaited<ReturnType<Photon["projects"]["listMessages"]>>["items"][number];

// Reply in the same conversation, as the agent that received the message.
export async function reply(m: Message, platform: "imessage" | "email", text: string) {
  if (m.platform !== platform || m.status !== "received") return;
  if (m.sentBy.platform !== platform || m.receivedBy?.platform !== platform || m.space.platform !== platform) return;
  // Answer people only: never another agent, and never your own outbound messages.
  if (m.sentBy.kind !== "human" || m.receivedBy.kind !== "agent" || m.sentBy.id === m.receivedBy.id) return;
  try {
    await photon.projects.setSpaceTyping({
      path: { id: projectId!, spaceId: m.space.id },
      body: { senderId: m.receivedBy.id, typing: true },
    }).catch(() => undefined); // typing is best effort; some channels refuse it
    await photon.projects.sendMessage({
      path: { id: projectId! },
      headers: { "idempotency-key": `reply:${m.id}` }, // stable per inbound message
      body: {
        spaceId: m.space.id,
        senderId: m.receivedBy.id,
        parentMessageId: m.id,
        content: { type: "text", format: "plain", text },
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Photon API error ${error.status} (request ${error.requestId ?? "unknown"})`);
    }
    throw error;
  }
}
```

Extend the `platform` union for the channels you handle. To read received messages in a test, page
through `photon.projects.listMessages` with
`query: { direction: "received", order: "asc", pageSize: 100, createdSince }`. For a running agent,
receive events instead of polling ([events.md](events.md)).

Python:

```python
from photon_api.rpc_generated import SendMessageInput

photon.projects.send_message(
    SendMessageInput.model_validate(
        {
            "path": {"id": project_id},
            "headers": {"idempotency-key": f"reply:{incoming_id}"},
            "body": {
                "spaceId": space_id,
                "senderId": agent_user_id,
                "parentMessageId": incoming_id,
                "content": {"type": "text", "format": "plain", "text": "Thanks, got it."},
            },
        }
    )
)
```

## Start a conversation

[Create or get a User](https://photon.codes/docs/beta/api-client/sdk/projects/create-or-get-user.md),
[Create or get a Space](https://photon.codes/docs/beta/api-client/sdk/projects/create-or-get-space.md)

To message someone first: get both Users with `createOrGetUser` (`{ handle, platform }`), get the Space
with `createOrGetSpace` (`{ platform, participantIds }`, an idempotency key required), then `sendMessage`.
Calling `createOrGetUser` with the line's own handle returns the Agent User (`kind: "agent"`). Ask the user
before every send.

- A shared iMessage line can't start a conversation: the person texts first. A new iMessage chat needs a
  project-owned dedicated line as the first participant.
- Participant counts: iMessage 2 to 1,000, WhatsApp and WhatsApp Business exactly 2, email 1 to 51, SMS
  2 to 9. Every Space needs an Agent the project owns (`422 SPACE_REQUIRES_OWNED_AGENT` otherwise). The
  one exception: a direct iMessage Space with a shared-line Agent whose peer has an active assignment of
  this project on that line.
- The Space's idempotency key binds the project, platform and participants for 24 hours; reuse it only for
  the same participants.

```typescript
// Same `photon` and `projectId` as above.
export async function startConversation(agentHandle: string, recipientHandle: string, text: string, key: string) {
  const platform = "imessage";
  const agent = await photon.projects.createOrGetUser({
    path: { id: projectId! },
    body: { handle: agentHandle, platform },
  });
  // The platform check narrows the User union so its fields are typed.
  if (agent.platform !== platform || agent.kind !== "agent") throw new Error("agentHandle is not this project's line");
  const recipient = await photon.projects.createOrGetUser({
    path: { id: projectId! },
    body: { handle: recipientHandle, platform },
  });
  if (recipient.platform !== platform) throw new Error("Unexpected user platform");
  const space = await photon.projects.createOrGetSpace({
    path: { id: projectId! },
    headers: { "idempotency-key": `space:${key}` },
    body: { platform, participantIds: [agent.id, recipient.id] }, // iMessage: the agent first
  });
  if (space.platform !== platform) throw new Error("Unexpected space platform");
  return photon.projects.sendMessage({
    path: { id: projectId! },
    headers: { "idempotency-key": `send:${key}` },
    body: { spaceId: space.id, senderId: agent.id, content: { type: "text", format: "plain", text } },
  });
}
```

The Chat SDK adapter does the same with `openDM` ([chat-sdk.md](chat-sdk.md#threads-and-direct-messages)).

## Attachments, reactions, edits, typing and read receipts

All go through `sendMessage` with another `content` type, except typing and read receipts, which have
their own calls. Channels differ: an unsupported type answers `422 UNSUPPORTED_CONTENT`, and typing answers
`OPERATION_UNAVAILABLE` where a channel has none. Check the Send a Message page for what each channel
takes.

| Do | How |
| --- | --- |
| Send a file | Upload it with `uploadAttachment` ([request format](https://photon.codes/docs/beta/api-client/sdk/projects/upload-attachment.md); idempotency key required), then send `{ type: "attachment", attachmentId }` |
| Read a received file | `downloadAttachment` with the attachment's ID (needs `project:read`) |
| React | `{ type: "reaction", reaction: "👍" }` with `parentMessageId` set to the message |
| Take a reaction back | `{ type: "message.delete" }` with `parentMessageId` set to the reaction message |
| Edit a sent message | `{ type: "message.update", content: { type: "text", format: "plain", text } }` with `parentMessageId` set to the message |
| Unsend | `{ type: "message.delete" }` with `parentMessageId` set to the message |
| Typing | `setSpaceTyping` with `{ senderId, typing: true }`; repeat to refresh, `false` to stop |
| Read receipt | `markMessageRead` on the incoming message, with an idempotency key such as `read:<message id>` |
| Email body | `{ type: "text", format: "html", text }`, or a `group` of a plain and an HTML part ([channels/email.md](channels/email.md)) |

Received content arrives the same way: an edit, reaction or deletion is a `message.received` event whose
content is `message.update`, `reaction` or `message.delete`. Handle unknown content types with a default
branch. These shapes changed in 0.7.0 (`text.update` and the reaction `action` field are gone).
MCP has no attachment tools; the CLI has no message commands.

## Message status

A message's `status` is `received` (inbound), then for outbound `dispatched`, `accepted`, `delivered` or
`failed`. A failed message carries `failure` with a `code` and `message`. Read it with `getMessage` or
`listMessages` (both need `project:read`). The documented webhook event is `message.received`; list the
live catalog with `photon project webhook event-type list` before relying on any other event. Debugging a
message that didn't arrive: [debugging.md](debugging.md).

## Pagination

List endpoints return a page and a `nextPageToken` when more follow; send it back as `pageToken`. The
clients don't page for you ([Pagination](https://photon.codes/docs/beta/api-client/pagination.md)).

```typescript
let pageToken: string | undefined;
do {
  const page = await photon.organizations.projects.list({
    path: { organizationId },
    query: { pageSize: 100, pageToken },
  });
  for (const project of page.projects) console.log(project.projectId, project.name);
  pageToken = page.nextPageToken;
} while (pageToken);
```

## Errors

[Errors](https://photon.codes/docs/beta/api-client/errors.md),
[Handling errors](https://photon.codes/docs/beta/problems/handling-errors.md),
[Problem catalog](https://photon.codes/docs/beta/problems/catalog.md)

- API errors are RFC 9457 problem documents (`application/problem+json`) with `type`, `code`, `title`,
  `status`, and usually `detail` and `requestId`. Match on `code` or `type`; never on `title` or `detail`.
- TypeScript throws `ApiError` (`status`, `body`, `requestId`), `TransportError` or
  `ResponseValidationError`, all extending `PhotonError`. Python raises the same classes, with
  `request_id`. Rust returns `Error::Api`, `Error::UnexpectedStatus`, `Error::Transport`, `Error::Timeout`
  and others; `is_transient()` says whether to retry.
- Log the `requestId` (header `X-Request-ID`) and quote it to support.

## Retries, timeouts and idempotency

[Retries, timeouts, and idempotency](https://photon.codes/docs/beta/api-client/retries-and-timeouts.md)

- The clients retry `GET` requests and requests carrying an idempotency key, on `408`, `429`, `502`, `503`
  and `504`, up to 3 attempts, honoring `Retry-After` up to 60 seconds. `500` is not retried. Rust and Go
  retry an upload only when its body can be sent again: Go buffers a one-shot reader up to 8 MiB and sends
  a larger one once, so pass an `*os.File` or another `io.ReaderAt` plus `io.Seeker` to keep retries.
- Timeouts apply within each attempt. TypeScript and Rust default to 30 seconds per attempt; Python's 30
  seconds apply separately to connecting, writing, reading and waiting for a pooled connection. The Go
  client sets no timeout: pass a `context.WithTimeout` to each call.
- Most writes require an idempotency key (`400 IDEMPOTENCY_KEY_REQUIRED` without one). Use one key per
  logical change (a UUID, or an ID derived from the inbound event: 1 to 255 visible ASCII characters, no
  spaces) and keep it while you retry that change, even after a timeout or restart. A replayed result has
  `Idempotent-Replayed: true`. Reusing a key for a different request is refused.
- Never put the idempotency key in the client-wide `headers`: every call would share one key.
- TypeScript: `timeoutMs`, `retry: { maxAttempts, maximumRetryAfterMs }`, or `retry: false`. Python:
  `timeout`, `max_attempts`, `max_retry_after`. Rust: `.timeout()`, `.max_attempts()`,
  `.maximum_retry_after()` on the builder.

## Raw HTTP

```sh
curl https://api.photon.codes/v1/projects/$PHOTON_PROJECT_ID \
  -H "Authorization: Bearer $PHOTON_API_KEY" \
  -H "Photon-Version: 2026-07-01"
```

Timestamps are RFC 3339 in UTC (`2026-01-01T00:00:00Z`).

## Acting for a person with OAuth

For a product that acts on behalf of Photon users ([auth.md](https://photon.codes/auth.md)): register a
client at `https://auth.photon.codes/oauth2/register` (dynamic registration), get a token with the
authorization code flow with PKCE (`S256`) or the device flow, request `offline_access` for a refresh
token, and send it as a Bearer token. The API intersects the consented scopes with each operation; an
empty intersection is `403 INSUFFICIENT_SCOPE`. Photon has no agent self-registration: an agent can't
create an account or credentials without a person. For products that whole organizations install, see
[apps.md](apps.md).
