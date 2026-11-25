# Email

Part of the Photon 2.0 skill. The overview of every channel, with plans and what each needs, is in [channels.md](../channels.md).

[Build an email agent](https://photon.codes/docs/beta/get-started/email.md),
[Email content and sending limits](https://photon.codes/docs/beta/messaging/email.md)

- Connect a domain: dashboard **Email** page, `photon project platform email connect <domain> --no-wait --json`,
  or the API. Without `--no-wait` the command waits for DNS verification, which can't happen until the
  records are published: read them from `operation.detail.dnsRecords`, publish them, then check the status.
  Use an unused subdomain such as `mail.example.com`: changing the receiving MX of a working domain moves
  its mail. Free allows one domain per project, Pro five.
- Publish every record Photon shows: DKIM CNAMEs, bounce MX and SPF TXT (sending), and the receiving MX
  (without it, nothing arrives). Use "DNS only" for proxied CNAMEs. Wait for **Connected**.
- Addresses under the domain need no separate creation; Photon resolves one when its first email arrives.
- Bodies: `{ "type": "text", "format": "plain" | "html", "text": ... }`, or a `group` with one plain and one
  HTML part as alternatives. Markdown isn't an email format; convert it first.
- Replies: send `parentMessageId`; Photon builds the threading headers. Don't invent Message-IDs or set mail
  headers. By default a reply goes to the parent's Reply-To or From and visible To and Cc (not Bcc), so set
  explicit recipient rules before automating multi-person threads. Don't build an open autoresponder.
- New organizations may send to 50 recipients per minute and 500 per rolling 24 hours, counted per
  recipient across projects. Over that: `429 RATE_LIMITED`. Wait at least `Retry-After`, back off, and retry
  with the same `Idempotency-Key` and body; a new key or project doesn't raise the allowance.
