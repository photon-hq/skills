# Photon documentation coverage

Verified on **2026-09-02** against <https://photon.codes/docs/llms.txt>. The canonical page-by-page and OpenAPI-tag ownership map is [`photon-docs-coverage.json`](./photon-docs-coverage.json). This report summarizes the routing model; the JSON file contains every current page path and every tracked API category.

## Spectrum

| Documentation area | Current page or tag | Owning skill | Owning file | Status | Notes |
|---|---|---|---|---|---|
| Core SDK | `/docs/spectrum-ts/introduction`, `getting-started`, `messages`, `spaces-and-users`, `reactions-and-replies`, `platform-narrowing` | `spectrum` | `skills/spectrum/` core files | Covered | Spectrum is the default new-agent abstraction. |
| Capability semantics | Cross-provider send, fallback, no-op, and throw behavior | `spectrum` | `skills/spectrum/capability-semantics.md` | Covered | Preserves the upstream contract distinction between send-routed operations and resolvers/reads. |
| Content and actions | `/docs/spectrum-ts/content/**` | `spectrum` | `skills/spectrum/content/` | Covered | Text, Markdown, attachments, voice, contacts, rich links, app cards, polls, groups, custom content, replies, edits, unsend, read, typing, rename, avatars, membership, and composition are split by topic. |
| iMessage provider | `/docs/spectrum-ts/providers/imessage/**` | `spectrum` | `skills/spectrum/providers/imessage.md` and `skills/spectrum/providers/imessage/` | Covered | Cloud/local routing and every currently indexed iMessage feature have explicit owners. |
| Other current providers | Telegram, Terminal, WhatsApp Business, and Voice pages | `spectrum` | `skills/spectrum/providers/` | Covered | Voice includes outbound, inbound, and troubleshooting guidance. |
| Supplemental provider guidance | Slack | `spectrum` | `skills/spectrum/providers/slack.md` | Supplemental | Retained for the shipped provider package but not counted as a current page in `llms.txt`. |
| Webhooks | `/docs/spectrum-ts/webhooks` | `spectrum` | `skills/spectrum/webhooks.md` | Covered | Owns the SDK request adapter; registration and delivery semantics route to `photon-webhooks`. |
| Integrations | Chat SDK and eve | `spectrum`, `chat-adapter-imessage` | `skills/spectrum/integrations/`, `skills/chat-adapter-imessage/` | Covered with drift note | eve follows the indexed page. The Chat SDK skill follows the currently published scoped package where the generated page still describes its previous unscoped release. |
| Customization and lifecycle | Custom platforms, custom events, lifecycle | `spectrum` | `skills/spectrum/custom-platforms.md`, `custom-events-and-lifecycle.md` | Covered | Current provider-contract and recovery guidance. |
| Best practices | `/docs/best-practices/**` | `spectrum` | `skills/spectrum/best-practices/` | Covered | Architecture, inbound pipeline, recovery/state, and iMessage deliverability. |

## CLI

| Documentation area | Current page or tag | Owning skill | Owning file | Status | Notes |
|---|---|---|---|---|---|
| Installation | `/docs/cli/installation` | `photon-cli` | `skills/photon-cli/getting-started.md` | Covered | Includes one-shot runners, global/standalone guidance, and the `pho` alias. |
| Authentication | `/docs/cli/authentication` | `photon-cli` | `skills/photon-cli/environment.md` | Covered | Device auth, no-browser, CI, storage, backend, and precedence. |
| Projects and billing | `/docs/cli/projects`, `/docs/cli/billing` | `photon-cli` | `skills/photon-cli/commands.md`, `workflows.md` | Covered | Current project creation and explicit warnings for rotation, deletion, and paid actions. |
| Spectrum resources | `/docs/cli/spectrum` | `photon-cli` | `skills/photon-cli/spectrum.md` | Covered | Profiles, users, lines, platforms, and avatars. |
| Profile and utilities | `/docs/cli/profile-and-utilities` | `photon-cli` | `skills/photon-cli/commands.md` | Covered | Current fields and read-only verification patterns. |

## Webhooks

| Documentation area | Current page or tag | Owning skill | Owning file | Status | Notes |
|---|---|---|---|---|---|
| Overview and quickstart | `/docs/webhooks/overview`, `quickstart` | `photon-webhooks` | `skills/photon-webhooks/SKILL.md`, `quickstart.md` | Covered | Public HTTPS, one-time secret capture, fast acknowledgement, and queues. |
| Events | `/docs/webhooks/events` | `photon-webhooks` | `skills/photon-webhooks/events.md` | Covered | Serialized event envelope, headers, IDs, and forward compatibility. |
| Signature verification | `/docs/webhooks/verifying-signatures` | `photon-webhooks` | `skills/photon-webhooks/verifying-signatures.md` | Covered | Raw bytes, freshness, constant-time comparison, and verify-before-parse. |
| Delivery and retries | `/docs/webhooks/delivery` | `photon-webhooks` | `skills/photon-webhooks/delivery-and-retries.md` | Covered | At-least-once delivery, deduplication, idempotency, and poison events. |
| Management and troubleshooting | Managing and troubleshooting pages | `photon-webhooks` | `skills/photon-webhooks/managing.md`, `troubleshooting.md` | Covered | Registration, list/delete, lost-secret recovery, reachability, and body mutation. |

## Low-level SDKs

| Documentation area | Current page or tag | Owning skill | Owning file | Status | Notes |
|---|---|---|---|---|---|
| Current Advanced iMessage | `/docs/advanced-kits/imessage/**` | `imessage` | `skills/imessage/advanced/` | Covered | Uses `@photon-ai/advanced-imessage` and isolates direct platform features by topic. |
| Local open-source iMessage | `/docs/opensource/imessage-kit` | `imessage` | `skills/imessage/opensource-imessage-kit.md` | Covered | macOS, Full Disk Access, local send/query/watch, and cleanup. |
| Legacy iMessage | `/docs/legacy/imessage` | `imessage` | `skills/imessage/legacy-advanced-imessage-kit.md` | Covered | Legacy package is maintenance-only and never the default path. |
| Chat SDK adapter | `/docs/integrations/chat-sdk` | `chat-adapter-imessage` | `skills/chat-adapter-imessage/` | Covered with source override | The live page currently describes unscoped `chat-adapter-imessage` 1.1.0 and local mode; the skill follows published `@photon-ai/chat-adapter-imessage` 3.2.0, its types, tests, and repository README. |
| WhatsApp Business SDK | `/docs/advanced-kits/whatsapp/**` | `whatsapp-business` | `skills/whatsapp-business/` | Covered | Messages, interactions, templates, events, media, and typed errors. |

## Utilities

| Documentation area | Current page or tag | Owning skill | Owning file | Status | Notes |
|---|---|---|---|---|---|
| HEIF conversion | `/docs/utilities/heif2jpeg` | `heif2jpeg` | `skills/heif2jpeg/SKILL.md` | Covered | Package API, quality, runtimes/platforms, thread pool, source build, and iMessage attachment example. |

## Dashboard API and OAuth

| Documentation area | Current page or tag | Owning skill | Owning file | Status | Notes |
|---|---|---|---|---|---|
| Overview and rate limits | API introduction and rate-limit pages | `photon-api` | `skills/photon-api/overview.md` | Covered | Separates management-plane HTTP from runtime messaging. |
| OAuth 2.1 and OIDC | `/docs/api-reference/oauth` | `photon-api` | `skills/photon-api/oauth.md` | Covered | PKCE S256, discovery, scopes, token rotation/lifetimes, OIDC verification, revocation, and current limitations. |
| Dashboard OpenAPI | `/docs/api-reference/dashboard-openapi.json`, `openapi:dashboard` | `photon-api` | `skills/photon-api/dashboard-api.md` | Covered | OpenAPI is the source of truth; endpoints are not inferred from CLI commands. |

## Spectrum API

| Documentation area | Current page or tag | Owning skill | Owning file | Status | Notes |
|---|---|---|---|---|---|
| Authentication and errors | `openapi:spectrum:authentication-and-errors` | `photon-api` | `skills/photon-api/spectrum-api/authentication-and-errors.md` | Covered | Basic auth, envelopes, rate limits, retries, redaction, and rotation. |
| Users, projects, billing, Fusor | Matching current OpenAPI tags | `photon-api` | `skills/photon-api/spectrum-api/` category files | Covered | Destructive and paid actions require confirmation. |
| iMessage, lines, platforms, Voice | Matching current OpenAPI tags | `photon-api` | Category files | Covered | Runtime messaging remains an SDK responsibility; line removal/addition warnings are explicit. |
| Webhooks | `openapi:spectrum:webhooks` | `photon-api` | `skills/photon-api/spectrum-api/webhooks.md` | Covered | Registration/list/delete and one-time secret boundaries. |
| WhatsApp Business and Slack | Matching current OpenAPI tags | `photon-api` | Category files | Covered | Provider credentials are protected; plaintext token responses are prominently warned. |

## Coverage result

- Current Photon documentation pages represented in the canonical map: **98**.
- OpenAPI category/tag ownership entries: **13**.
- Supplemental package-derived page mappings: **2**.
- Known semantic source overrides: **1** (`chat-adapter-imessage`, published package 3.2.0 over the older generated page).
- Missing owner files at verification time: **0**.
- Unapproved duplicate canonical owners: **0**.
- Stale current-page mappings at verification time: **0**.
