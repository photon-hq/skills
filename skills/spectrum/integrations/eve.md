# eve Photon channel

Use eve's Photon channel when an eve agent should live in iMessage without manually constructing a Chat SDK `Chat` instance or a `SpectrumInstance`.

The channel wraps Photon's Chat SDK iMessage adapter, receives authenticated Photon webhook deliveries at `/eve/v1/photon`, keeps each iMessage conversation in one eve session, and marks accepted messages as read. When another accepted message arrives during an active turn, eve cooperatively cancels and steers the replacement turn instead of starting an independent second reply. Replies are delivered as complete messages rather than token streams.

The channel's TypeScript API is evolving. Use the upstream eve channel reference for current imports, options, and callback signatures rather than copying an old shape.

## Add the channel

From an existing eve agent:

```bash
eve add channel/photon-imessage
```

The setup wizard can create or connect a Photon project, register the iMessage number, choose a credential mode, and scaffold the channel file.

## Credential modes

### Vercel Connect

Use this for an agent deployed on Vercel. The wizard links the Vercel project, creates a Photon connector, configures the webhook, and writes the connector ID into the generated channel. Same-project Vercel OIDC verifies forwarded webhooks, so this path does not require `IMESSAGE_WEBHOOK_SECRET`.

### Portable credentials

Use this on another host:

```text
IMESSAGE_PROJECT_ID
IMESSAGE_PROJECT_SECRET
IMESSAGE_WEBHOOK_SECRET
```

Register a Photon webhook for the public route:

```text
https://your-host.example/eve/v1/photon
```

Store all three values in the host's encrypted environment settings. The project secret authorizes Photon API access; the webhook secret authenticates inbound deliveries. They are separate credentials and must not be committed.

A custom webhook verifier takes precedence over the signing secret.

## Filtering and enrichment

Use the channel's `onMessage` callback to decide which inbound messages reach the agent and to attach private turn context. The callback receives the Chat SDK message, and its context can expose the low-level thread for advanced iMessage operations. Confirm the current callback signature in eve's Photon channel reference before implementation.

Official source: <https://photon.codes/docs/integrations/eve>
