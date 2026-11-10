# Spectrum Slack provider

> **Supplemental guidance.** `spectrum-ts` currently ships the Slack provider package, but Slack pages are not listed in Photon's live `llms.txt` documentation index. Inspect the installed package and current source before depending on a version-sensitive option.

## Setup

```ts
import { slack } from "spectrum-ts/providers/slack";

slack.config({
  tokens: {
    TEAM_A: process.env.SLACK_TOKEN_A!,
    TEAM_B: process.env.SLACK_TOKEN_B!,
  },
  teams: {
    TEAM_A: {
      appId: "A0123456789",
      botUserId: "U0123456789",
      grantedScopes: ["chat:write", "channels:history"],
      teamName: "Team A",
    },
  },
});
```

`tokens` maps team IDs to `xoxb-...` bot tokens. `teams` is optional metadata. `endpoint` can use `SPECTRUM_SLACK_ENDPOINT`. In cloud mode, an empty config may use project-managed installations when the installed package supports it.

## Conversations

```ts
const sl = slack(app);
const user = await sl.user("U0123456789");
const dm = await sl.space.create(user, { teamId: "TEAM_A" });
```

Narrowed spaces expose `teamId`. Narrowed messages may expose `isFromMe`, optional `subtype`, `threadTs`, and `ts`.

Slack supports text, mrkdwn, files, reactions, and threaded replies in the documented package contract. Typing is accepted as a no-op. Do not assume outbound edit support without checking the installed version.

Never log or commit bot tokens.

Source package: <https://github.com/photon-hq/spectrum-ts>
