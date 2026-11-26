# Debugging delivery

Diagnose before you change anything. Creating assignments, buying lines, rotating keys or recreating a
webhook are not fixes to try: each needs the user's yes, and most hide the real cause.

## Where to look

| Tool | What it tells you |
| --- | --- |
| Message `status` (`getMessage`, `listMessages`, MCP or API) | `received` (inbound); outbound `dispatched`, `accepted`, `delivered` or `failed`. A failed message has `failure.code` and `failure.message` |
| The API error | `code` (branch on it), HTTP status, `requestId`. CLI errors also carry `next` steps |
| Dashboard [API Activities](https://app.beta.photon.codes/project/activity) | Send outcomes and request history |
| Dashboard [Event Deliveries](https://app.beta.photon.codes/project/activity/events) | Webhook attempts and why they failed |
| MCP `listDeveloperTraces` (filter by `requestId`, `httpStatusCode`, `route`), `getDeveloperTrace`, `listDeveloperOtelLogs` | What happened to one request inside Photon |
| MCP or API `queryMessageMetrics` | Read-only SQL over the project's message and call events (get the schema with `getMessageMetricsSqlSchema` first) |
| The dashboard's channel page (for example the iMessage page) | The conversation as Photon sees it |

Quote the `requestId` when the user contacts support@photon.codes.

## The person's message never reaches the agent

- **Shared iMessage line**: the sender must be the assignment's exact `handle` (a phone number and an
  Apple-account email are different senders, even for one person), texting the assignment's
  `assignedPhoneNumber`, in a direct conversation (no groups), as an iMessage (not SMS), and after the
  assignment was created. Only the assigned person's messages reach the project. The assignment's
  `optIn.state` stays `pending` until they text.
- **Dedicated line**: `state` is `active` and `detail.imessageHealth.overallStatus` is `available`.
- **Agent process**: it is running, connected to the right project (`PHOTON_PROJECT_ID`) with that
  project's key, the `message.received` handler is registered, and the stream subscription was
  acknowledged (or the webhook destination is `enabled`).
- **Stream on first start**: messages sent before the first acknowledgement are never delivered over the
  stream. Read them with `listMessages`.
- **Filters**: the agent's own reply filter may drop the message (wrong `PHOTON_AGENT_HANDLE`, an email
  compared case-sensitively).

## Webhooks don't arrive

- The URL is public HTTPS, doesn't redirect, and isn't localhost or a private address.
- The destination is `enabled` (`photon project webhook list --json`) and subscribed to
  `message.received` on the API version the code expects. After 20 failed attempts or four days, or one
  `410`, Photon disables it.
- Verification uses the raw body and this destination's own `whsec_` secret, and the server clock is in
  sync. A `400` from your own verifier shows in Event Deliveries.
- A firewall in front of the route allows Photon's addresses (`listWebhookEgressAddresses`).
- A delivery still waiting can be retried at once with the API's `retryWebhookDelivery` (with its
  `eventId` and an idempotency key); the CLI and MCP can't.

## The event stream doesn't connect

A refused connection arrives as `connect_error` with no status or code. Don't retry in a loop:

1. `PHOTON_PROJECT_ID` is the selected project.
2. Read the key's ID from the env file, never the whole key:
   `sed -n 's/^PHOTON_API_KEY=\(pho_sk_[0-9a-z]\{26\}\)_.*/\1/p' .env.local`. Then
   `photon project api-key list --project <id> --json`: the ID must be listed, unexpired, with
   `project:read`. An ID that isn't listed belongs to another project.
3. Make one read with the app's own key, loading the env file the way the app does (for Node,
   `node --env-file=.env.local`), for example `listMessages` with `pageSize: 1`, and print only the HTTP
   status, `code` and `requestId`. `401`: Photon refused the key itself (missing, expired, revoked).
   `403`: the key is valid but not allowed here (another project, missing permission).
4. The client uses Socket.IO with the websocket transport and the project's events path, and subscribes
   inside the `connect` handler. `delivery_error` codes: [Errors](https://photon.codes/docs/beta/websocket/errors.md).

## The reply is accepted but not delivered

`202` means accepted. Read the message's `status` and `failure`, then:

- The send reused the incoming message's `space.id` and `receivedBy.id`, and the key has `project:write`.
- The channel allows it: a shared line sends only to someone who messaged it since their assignment, only
  in direct spaces; SMS to US numbers needs an approved 10DLC campaign on the sending number.
- Check the send in API Activities and its trace with `listDeveloperTraces` by `requestId`.

When you report a shared-line cause, also tell the user the line's limits in a sentence (the person texts
first, direct conversations only, no groups): they decide what the agent can do next.

## Common error codes

| Code | Status | Meaning | Do |
| --- | --- | --- | --- |
| `SHARED_LINE_INBOUND_REQUIRED` | 403 | The person hasn't texted the shared line since their assignment | Ask them to send a message first |
| `SHARED_LINE_NOT_ASSIGNED` | 403 | No active assignment for that person on this line | Check `assignment list`; create one only with a yes |
| `SHARED_LINE_GROUP_UNSUPPORTED` | 422 | Shared lines don't do groups | Use a direct space, or a dedicated line |
| `SHARED_LINE_CAP_EXCEEDED` | 409 | Every assignment seat is used | Tell the user: release one or upgrade, with a yes |
| `SHARED_LINE_POOL_EXHAUSTED` | 503 | No shared line free right now | Report it; the error says whether a retry can work |
| `SENDER_NOT_SENDABLE` | 409 | The sending line can't send now (for example iMessage not registered on a dedicated number) | Check the line's health; pick another line |
| `SPACE_NOT_SENDABLE` | 409 | The conversation can't take a send | Check the space and the channel's rules |
| `SPACE_REQUIRES_OWNED_AGENT` | 422 | No project-owned agent in the participants | Put the project's agent user in `participantIds` |
| `SMS_CAMPAIGN_NOT_ELIGIBLE` | 409 | The number has no eligible 10DLC campaign | See [channels/sms.md](channels/sms.md#10dlc-registration) |
| `UNSUPPORTED_CONTENT` | 422 | The channel doesn't take that content type | Send something the channel supports |
| `OPERATION_UNAVAILABLE` | 422 | The channel doesn't offer the operation (for example typing) | Skip it on that channel |
| `ENTITLEMENT_REQUIRED` | 402 | Needs a plan or a payment card (`card_required`) | Tell the user; they add the card or change the plan |
| `TELEGRAM_BOT_ALREADY_CONNECTED` | 409 | One bot per project | Disconnect the old one only with a yes |
| `WHATSAPP_PERSONAL_NOT_AVAILABLE` | 403 | Personal WhatsApp isn't released | Use WhatsApp Business |
| `IDEMPOTENCY_KEY_REUSED` | 422 | One key used for a different request | Use a new key for a new logical change |
| `INVALID_API_VERSION` | 400 | Missing or wrong `Photon-Version` | Send `2026-07-01` |
| `INSUFFICIENT_SCOPE` | 403 | An OAuth token lacks the scope | Request the scope in the sign-in |

All codes: [Problem catalog](https://photon.codes/docs/beta/problems/catalog.md).
