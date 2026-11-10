# iMessage group membership

```ts
import {
  addMember,
  leaveSpace,
  removeMember,
} from "spectrum-ts";

await space.add("+15553333333");
await space.add([alice, "carol@example.com"]);
await space.remove("+15553333333");
await space.leave();

await space.send(addMember("+15553333333"));
await space.send(removeMember("+15553333333"));
await space.send(leaveSpace());
```

Handles are E.164 phone numbers or complete email addresses. Empty input batches reject at build time.

Membership writes require a cloud iMessage group with the corresponding provider capability. They use Spectrum's send-routed semantics: unsupported writes can warn and skip rather than throwing to the caller. Awaiting the call confirms dispatch finished, not that Apple changed the group.

Reconcile an important mutation through inbound group events or a supported member read:

```ts
const members = await space.getMembers();
console.log("group membership reconciled", {
  memberCount: members.length,
});
```

For iMessage-specific member fields, narrow the app:

```ts
import { imessage } from "spectrum-ts/providers/imessage";

const im = imessage(app);
const detailed = await im.getMembers(space);
console.log("detailed members resolved", {
  memberCount: detailed.length,
  services: [...new Set(detailed.map((member) => member.service))],
});
```

Do not log raw member addresses. `getMembers()` and `im.getMembers(...)` are provider reads outside the send path and can throw `UnsupportedError`. Local iMessage and DMs do not support group membership; a DM cannot be converted into a group.

Official source: <https://photon.codes/docs/spectrum-ts/providers/imessage/messaging-features/group-membership>
