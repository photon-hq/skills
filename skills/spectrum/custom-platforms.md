# Building a custom platform

> TypeScript samples below — the authoring contract (config, user/space resolvers, lifecycle, messages, send, events, and actions) is language-neutral; the TS SDK validates with Zod.

`definePlatform` takes a platform ID and a definition object and returns a callable that exposes `.config()` for registration and accepts a Spectrum instance, space, or message for [narrowing](./platform-narrowing.md).

Platform IDs must match `/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/`: use lowercase letters, numbers, and single underscores. Hyphens, spaces, and uppercase letters are rejected.

```ts
import { definePlatform, UnsupportedError, type EventProducer } from "spectrum-ts";
import z from "zod";

const configSchema = z.object({ apiKey: z.string() });
type MyConfig = z.infer<typeof configSchema>;

// A named factory lets TypeScript infer the client type for every later callback.
const createMyPlatformClient = async ({ config }: { config: MyConfig }) => {
  return new MyPlatformClient(config.apiKey);
};

const customEvents: {
  typing: EventProducer<
    { spaceId: string; userId: string },
    MyPlatformClient,
    MyConfig
  >;
} = {
  async *typing({ client }) {
    for await (const ev of client.typing()) {
      yield { spaceId: ev.chatId, userId: ev.user };
    }
  },
};

export const myPlatform = definePlatform("my_platform", {
  config: configSchema,

  lifecycle: {
    createClient: createMyPlatformClient,
    destroyClient: async ({ client }) => { await client.disconnect(); },
  },

  user: {
    resolve: async ({ input, client }) => ({
      id: input.userID,
      displayName: await client.lookupUser(input.userID),
    }),
  },

  space: {
    create: async ({ input, client }) => ({
      id: await client.findOrCreateConversation(input.users.map(u => u.id)),
    }),
    // Optional here because no space schema requires extra fields. Omit to
    // accept the { id } default; implement it when space.schema needs more.
    get: async ({ input, client }) => ({ id: input.id }),
  },

  // Required core inbound stream — `events` is only for extra streams.
  async *messages({ client }) {
    for await (const msg of client.onMessage()) {
      yield {
        id: msg.id,
        content: { type: "text", text: msg.body },
        sender: {
          id: msg.authorId,
          displayName: await client.lookupUser(msg.authorId),
        },
        space: { id: msg.channelId },
        timestamp: new Date(msg.ts),
      };
    }
  },

  // Required core outbound dispatcher — every Content variant flows here.
  // Assume text/reply writes return { id: string } and react returns its
  // native id or undefined. Reactions still need a stable unsend handle.
  send: async ({ space, content, client }) => {
    switch (content.type) {
      case "text": {
        const { id } = await client.send(space.id, content.text);
        return { id, content, space, timestamp: new Date() };
      }
      case "reaction": {
        const nativeId = await client.react(space.id, content.target.id, content.emoji);
        const id = nativeId ?? `reaction:${content.target.id}:${content.emoji}`;
        return { id, content, space, timestamp: new Date() };
      }
      case "reply": {
        const { id } = await client.reply(space.id, content.target.id, content.content);
        return { id, content, space, timestamp: new Date() };
      }
      case "typing":
        await client.setTyping(space.id, content.state === "start");
        return undefined;
      default:
        throw UnsupportedError.content(content.type, "my_platform");
    }
  },

  // Optional provider-specific streams beyond the core `messages` stream.
  events: customEvents,

  // Optional provider-level methods. Framework-recognized actions include
  // getMessage, getMembers, getAvatar, and getDisplayName.
  actions: {
    getMessage: async ({ client }, space, messageId) => {
      return await client.fetchMessage(space.id, messageId);
    },
  },

  static: {
    reactions: { thumbsUp: "+1", thumbsDown: "-1" } as const,
  },
});
```

## Field reference

| Field | Required | Description |
|---|---|---|
| `config` | Yes | Zod schema validating `platform.config()` argument. If every field is optional, `.config()` can be called with no arguments. |
| `user.resolve` | Yes | Resolves a user from a string ID. Returns at minimum `{ id }`. |
| `user.schema` | No | Optional Zod schema for extra user properties. |
| `space.create` | Yes | Creates (or finds) a conversation from users + optional params. Exposed as `platform.space.create(...)`. |
| `space.get` | No | Resolves an existing conversation from an id (`platform.space.get(id)`). Omission defaults to `{ id }`, which must pass `space.schema`; implement the hook when the schema requires other fields. |
| `space.schema` / `space.params` | No | Schemas for the resolved space and for extra creation params. |
| `space.actions` | No | Adds provider-specific methods to narrowed spaces. Reserved universal `Space` method names are skipped. |
| `lifecycle.createClient` | Yes | Creates the platform client. Receives `config`, `projectConfig`, `projectId`, `projectSecret`, and `store`. |
| `lifecycle.destroyClient` | No | Tears down the client on shutdown. |
| `messages` | Yes | Top-level async generator yielding incoming messages. |
| `send` | Yes | Top-level dispatcher for every outgoing `Content` variant. Return a provider message record for message-producing sends, `undefined` only for handled fire-and-forget controls, and throw `UnsupportedError.content(...)` for unsupported variants. |
| `events.[custom]` | No | Additional generators — exposed on `app.[eventName]`. |
| `actions.getMessage` / `getMembers` / `getAvatar` / `getDisplayName` | No | Framework-recognized provider-level capabilities. All four methods remain available when omitted, but their defaults throw `UnsupportedError`. |
| `actions.[custom]` | No | Adds a provider-specific method to the narrowed platform instance. |
| `message.schema` | No | Zod schema for extra typed fields on incoming messages — surfaced through narrowing. |
| `message.actions` | No | Adds provider-specific methods to narrowed messages. Reserved universal `Message` method names are skipped. |
| `static` | No | Provider constants attached to the platform object, such as effect IDs or custom reaction aliases. |

## Event producers

The required top-level `messages` producer and every custom event generator receive `{ client, config, projectConfig, store }` and return an `AsyncIterable`. Keep `messages` at the top level; `events` is only for extra streams. Give custom events an explicit `EventProducer` type so their payload, client, and config types remain inferred:

```ts
const customEvents: {
  typing: EventProducer<
    { spaceId: string; userId: string },
    MyPlatformClient,
    MyConfig
  >;
} = {
  async *typing({ client }) {
    for await (const ev of client.typing()) {
      yield { spaceId: ev.chatId, userId: ev.user };
    }
  },
};

// Inside definePlatform(...):
async *messages({ client }) { /* yield ProviderMessage records */ },
events: customEvents,
```

Non-`messages` events are auto-wired as flat properties on both `app` and the narrowed platform instance.

## Registering

```ts
const app = await Spectrum({
  providers: [myPlatform.config({ apiKey: process.env.MY_KEY! })],
});

const mine = myPlatform(app);
const space = await mine.space.create(await mine.user("user-123"));
await space.send("Hello from my custom platform.");
```
