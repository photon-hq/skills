# Photon API and clients

REST over JSON at `https://api.photon.codes`, every endpoint under `/v1`. The clients are generated from the
public OpenAPI contract (https://api.photon.codes/openapi.json) and live in https://github.com/photon-hq/api.
Docs: [API reference](https://photon.codes/docs/beta/api-reference/index.md),
[API clients](https://photon.codes/docs/beta/api-client/index.md).

The TypeScript and Python samples here type-check or validate against `@photon-ai/api` and `photonhq-api`
0.8.0. Use only methods and fields shown in the docs or in each client's types; every endpoint page in the
API reference shows the call in TypeScript, Python, Rust and Go.

## Packages

| Language | Install | Import | Needs |
| --- | --- | --- | --- |
| TypeScript | `npm install @photon-ai/api` | `import { Photon } from "@photon-ai/api"` (ES module) | Node.js 22+ |
| Python | `pip install photonhq-api` | `from photon_api import Photon` (also `AsyncPhoton`) | Python 3.11+ |
| Rust | `cargo add photonhq-api`, `cargo add reqwest@0.13 --no-default-features` (for `HeaderMap`) and `cargo add tokio --features macros,rt-multi-thread` | `use photon_ai_api::...` | Rust 1.88+, Tokio |
| Go | `go get github.com/photon-hq/api/packages/go` | `photonapi` | Go 1.25+ |

All four share one version number (0.8.0 on 2026-11-25). Below 1.0, a minor release can break code, so pin
one minor version: npm's default `^0.x.y`, pip `photonhq-api~=0.x.y`, Cargo's default `0.x.y`
([Versioning](https://photon.codes/docs/beta/api-client/versioning.md)). The docs' walkthroughs pin 0.5.0;
read the [changelog](https://photon.codes/docs/beta/changelog.md) for breaking changes since then.

## Credentials and the version header

[Credentials](https://photon.codes/docs/beta/api-client/credentials.md),
[API contract versioning](https://photon.codes/docs/beta/api-client/api-versioning.md)

- Every credential goes in `Authorization: Bearer <credential>`. Use the narrowest one: a project API key
  (`pho_sk_...`) works only under `/v1/projects/{projectId}` for its own project; organization and account
  endpoints (such as listing projects) need an account service key (`pho_ask_...`), a service identity
  credential, or an OAuth token.
- Send `Photon-Version: 2026-07-01` on every request. It is the only supported date. The clients don't send
  it by default, so set it as a client-wide header. From 2026-11-23 Photon removes the fallback for a missing
  header one API at a time; a request without it then fails with `400 INVALID_API_VERSION`.
- Rust checks each operation's accepted credentials before sending. Register the key under its scheme name:
  `"projectApiKey"`, `"accountServiceKey"`, `"serviceIdentityBearer"` or `"oauth2"`. A header set by hand
  doesn't count. To send `Photon-Version` in Rust, pass a `reqwest` `HeaderMap` to
  `PhotonClientBuilder::static_headers`, as the versioning page shows.
- The clients don't run OAuth flows. For a token that refreshes, pass a function as `headers` (TypeScript,
  Python) or a `Credential::Provider` (Rust).
- Keep keys on servers. Read them from the environment, never from source or config files.

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
  with `model_validate` from a dict using the contract's names. Responses keep the contract's names
  (`page.nextPageToken`). A missing optional field is `MISSING`, which is truthy: test
  `isinstance(page.nextPageToken, str)`.
- **Rust**: `client.<operation_in_snake_case>`; path parameters, required headers and the body are positional
  (check the order on https://docs.rs/photonhq-api/latest/photon_ai_api/); optional parameters go in
  `<Operation>Params`. Results are
  `Result<ResponseValue<T>, Error<E>>`; `into_inner()` gives the body.

## Messages

[Send a Message](https://photon.codes/docs/beta/api-client/sdk/projects/send-message.md),
[List messages](https://photon.codes/docs/beta/api-client/sdk/projects/list-messages.md),
[Build an iMessage agent](https://photon.codes/docs/beta/get-started/imessage.md)

- Concepts: an **Agent User** (`pho_usr_...`) is the number, address or bot your project sends from; a
  **Space** (`pho_spc_...`) is a conversation. A received message names the agent in `receivedBy`.
- `sendMessage` (`POST /v1/projects/{id}/messages`) needs `project:write` and an `idempotency-key` header.
  A `202` means Photon accepted the message for asynchronous delivery, not that it arrived. Track the outcome
  through message events ([webhooks-and-ws.md](webhooks-and-ws.md)) or the dashboard's API Activities.
- To reply, reuse the incoming message: `space.id` as `spaceId`, `receivedBy.id` as `senderId`, its `id` as
  `parentMessageId`, and a stable key such as `reply:<incoming message id>`, kept across retries.
- Channel rules still apply: a shared iMessage line sends only in direct Spaces to a person who has messaged
  it since their assignment. SMS and MMS need current Platforms authorization for the sender and every
  recipient, and campaign eligibility (an approved 10DLC campaign for US numbers) unless every recipient is
  in-network ([channels/sms.md](channels/sms.md)).
- Ask the user before any send, including tests.

TypeScript, using a project API key with `project:read` and `project:write`:

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

The platform checks narrow the message union so its fields are typed; extend the `platform` union for the
channels you handle. To read received messages in a test, page through `photon.projects.listMessages` with
`query: { direction: "received", order: "asc", pageSize: 100, createdSince }`. For a running agent, use
events instead of polling.

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

Content: text is `{ "type": "text", "format": "plain", "text": ... }`. Email also takes `"format": "html"`, or
a `group` with plain and HTML parts ([Email content](https://photon.codes/docs/beta/messaging/email.md)).
Check the Send a Message page for other content types (attachments, voice, edits, reactions) and which
channels accept them.

## Pagination

List endpoints return a page and a `nextPageToken` when more follow; send it back as `pageToken`. The clients
don't page for you ([Pagination](https://photon.codes/docs/beta/api-client/pagination.md)).

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
  `ResponseValidationError`, all extending `PhotonError`. Python raises the same classes, with `request_id`.
  Rust returns `Error::Api`, `Error::UnexpectedStatus`, `Error::Transport`, `Error::Timeout` and others;
  `is_transient()` says whether to retry.
- Log the `requestId` (header `X-Request-ID`) and quote it to support.

## Retries, timeouts and idempotency

[Retries, timeouts, and idempotency](https://photon.codes/docs/beta/api-client/retries-and-timeouts.md)

- The clients retry `GET` requests and requests carrying an `Idempotency-Key`, on `408`, `429`, `502`, `503`
  and `504`, up to 3 attempts, honoring `Retry-After` up to 60 seconds. `500` is not retried.
- Timeouts apply within each attempt, never to the whole call. TypeScript and Rust default to 30 seconds per
  attempt; Python's 30 seconds apply separately to connecting, writing, reading and waiting for a pooled
  connection. The Go client sets no timeout: pass a `context.WithTimeout` to each call, or an `http.Client`
  with `Timeout` through `WithHTTPClient`.
- Most writes require an idempotency key (`400 IDEMPOTENCY_KEY_REQUIRED` without one). Use one new key per
  logical change (a UUID, or an ID derived from the inbound event) and keep it while you retry that change,
  even after a timeout or restart. A replayed result has `Idempotent-Replayed: true`.
- Never put `Idempotency-Key` in the client-wide `headers`: every call would share one key.
- TypeScript: `timeoutMs`, `retry: { maxAttempts, maximumRetryAfterMs }`, or `retry: false`. Python:
  `timeout`, `max_attempts`, `max_retry_after`. Rust: `.timeout()`, `.max_attempts()`,
  `.maximum_retry_after()` on the builder.

## Raw HTTP

```sh
curl https://api.photon.codes/v1/account \
  -H "Authorization: Bearer $PHOTON_API_KEY" \
  -H "Photon-Version: 2026-07-01"
```

Timestamps are RFC 3339 in UTC (`2026-01-01T00:00:00Z`). The OpenAPI schema is at
https://api.photon.codes/openapi.json.

## Acting for a person with OAuth

For a product that acts on behalf of Photon users ([auth.md](https://photon.codes/auth.md)): register a client
at `https://auth.photon.codes/oauth2/register` (dynamic registration), get a token with the authorization code
flow with PKCE (`S256`) or the device flow, request `offline_access` for a refresh token, and send it as a
Bearer token. The API intersects the consented scopes with each operation; an empty intersection is
`403 INSUFFICIENT_SCOPE`. Photon has no agent self-registration: an agent can't create an account or
credentials without a person. For products that whole organizations install, see [apps.md](apps.md).
