# iMessage deliverability

Apple filters behavior rather than message content. Design for genuine, opted-in, two-way conversation.

## Inbound-first

Prefer users messaging the line first. Use prefilled `sms:` links and share a native contact card after the first exchange. Encourage real dialogue; the official guidance recommends at least three user messages in a conversation to build trust.

## Documented capacity

| Limit | Meaning |
|---|---|
| 5,000 outbound messages per server per day | Additional sends reject until reset unless Photon increases capacity. |
| 50 new conversations per line per day | First outbound message to a never-contacted recipient; replies do not count. |

Operating recommendations are roughly 700–1,000 users per line for moderate usage and 500–700 for intensive usage. These are planning ranges, not hard limits. Stop assigning new users around 70–80% utilization and add capacity or enable Business auto-scale.

## High-risk patterns

- Tight bursts, especially 100+ sends from one line.
- Broadcasts without replies.
- More than two or three follow-ups to non-responders.
- Cold outreach without opt-in.
- Automated off-hours traffic.
- Links or media in the first message before the user replies.

Spread new inbound contacts across lines, pace naturally, keep fallback lines active, monitor line health, and separate iMessage performance from SMS/RCS carrier fallback behavior.

For a flagged line, review the preceding hour, reduce risky behavior, keep auto-scale and routing healthy, and contact Photon support with the project and line identifiers.

Official source: <https://photon.codes/docs/best-practices/imessage-deliverability>
