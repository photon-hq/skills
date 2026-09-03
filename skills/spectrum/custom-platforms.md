# Building a custom platform

> TypeScript samples below — the authoring contract (config, user/space resolvers, lifecycle, messages, send, events, and actions) is language-neutral; the TypeScript SDK validates with Zod.

`definePlatform` takes a platform ID and a definition object and returns a callable that exposes `.config()` for registration and accepts a Spectrum instance, space, or message for [narrowing](./platform-narrowing.md).

Platform IDs must match `/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/`: use lowercase letters, numbers, and single underscores. Hyphens, spaces, and uppercase letters are rejected rather than normalized.

```ts
import { definePlatform, UnsupportedError, type EventProducer } from "spectrum-ts";
import z from "zod";

const configSchema = z.object({ apiKey: z.string() });
type MyConfig = z.infer<typeof configSchema>;

// A named factory lets TypeScript infer the client type for later callbacks.
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
    destroyClient: async ({ client }) => {
      await client.disconnect();
    },
  },

  user: {
    resolve: async ({ input, client }) => ({
      id: input.userID,
      displayName: await client.lookupUser(input.userID),
    }),
  },

  space: {
    create: async ({ input, client }) => ({
      id: await client.findOrCreateConversation(input.users.map((user) => user.id)),
    }),
    // Optional because no space schema requires extra fields. Implement it
    // when space.schema needs more than the platform id.
    get: async ({ input }) => ({ id: input.id }),
  },

  // Required core inbound stream. `events` is only for additional streams.
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

  // Required core outbound dispatcher. Every Content variant flows here.
  send: async ({ space, content, client }) => {
    switch (content.type) {
      case "text": {
        const { id } = await client.send(space.id, content.text);
        return { id, content, space, timestamp: new Date() };
      }
      case "reaction": {
        const nativeId = await client.react(
          space.id,
          content.target.id,
          content.emoji,
        );
        const id = nativeId ?? `reaction:${content.target.id}:${content.emoji}`;
        return { id, content, space, timestamp: new Date() };
      }
      case "reply": {
        const { id } = await client.reply(
          space.id,
          content.target.id,
          content.content,
        );
        return { id, content, space, timestamp: new Date() };
      }
      case "typing":
        await client.setTyping(space.id, content.state === "start");
        return undefined;
      default:
        throw UnsupportedError.content(content.type, "my_platform");
    }
  },

  // Additional provider-specific streams beyond the core messages stream.
  events: customEvents,

  // Framework-recognized and provider-specific platform methods.
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
| `config` | Yes | Zod schema validating `platform.config()` arguments. If every field is optional, `.config()` can be called with no arguments. |
| `user.resolve` | Yes | Resolves a user from a string ID and returns at least `{ id }`. |
| `user.schema` | No | Zod schema for extra typed user properties. |
| `space.create` | Yes | Creates or finds a conversation from users and optional params. Exposed as `platform.space.create(...)`. |
| `space.get` | No | Resolves an existing conversation from an ID. Omission defaults to `{ id }`; implement the hook when `space.schema` requires more fields. |
| `space.schema` / `space.params` | No | Schemas for resolved spaces and extra creation or get parameters. |
| `space.actions` | No | Adds provider-specific methods to narrowed spaces. Reserved universal `Space` names are skipped. |
| `lifecycle.createClient` | Yes | Creates the platform client. Receives `config`, project configuration, project credentials, and the store. |
| `lifecycle.destroyClient` | No | Tears down the client during `app.stop()`. |
| `messages` | Yes | Top-level async producer for incoming provider messages, or the Fusor delivery handler for a webhook-backed platform. |
| `send` | Yes | Dispatches every outgoing `Content` variant. Return a provider message record, `undefined` for handled fire-and-forget controls, or throw `UnsupportedError.content(...)`. |
| `events.[custom]` | No | Additional generators exposed on `app` and the narrowed platform instance. |
| `actions.getMessage` / `getMembers` / `getAvatar` / `getDisplayName` | No | Framework-recognized provider capabilities. Omitted defaults throw `UnsupportedError`. |
| `actions.[custom]` | No | Adds a provider-specific method to the narrowed platform instance. |
| `message.schema` | No | Zod schema for extra typed message fields surfaced through narrowing. |
| `message.actions` | No | Adds provider-specific methods to narrowed messages. Reserved universal names are skipped. |
| `static` | No | Provider constants attached to the callable, such as effect IDs or reaction aliases. |

Nested message targets can provide their own `direction`; otherwise they inherit the outer provider record's direction.

## Event producers

The required `messages` producer and every custom event generator receive the platform client, validated config, project config, and store. Keep `messages` at the top level; `events` is only for additional streams.

Give custom events an explicit `EventProducer` type so payload, client, and config types remain inferred:

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
async *messages({ client }) {
  // Yield provider message records.
},
events: customEvents,
```

Non-`messages` events are wired as flat properties on both `app` and the narrowed platform instance.

## Fusor-backed webhook platforms

Use `fusor(...)` when the provider receives messages through signed HTTP deliveries instead of a persistent event connection:

```ts
import { definePlatform, fusor } from "spectrum-ts";
import z from "zod";

const webhookPlatform = definePlatform("my_webhook_platform", {
  config: z.object({ webhookSecret: z.string() }),

  lifecycle: {
    createClient: async ({ config }) =>
      fusor("my_webhook_platform", (request) => {
        verify(request.rawBody, request.headers, config.webhookSecret);
        return JSON.parse(new TextDecoder().decode(request.rawBody));
      }),
  },

  messages: async ({ payload, respond }) => {
    respond({ status: 200 });
    return {
      id: payload.id,
      content: { type: "text", text: payload.text },
      sender: { id: payload.userId },
      space: { id: payload.chatId },
      timestamp: new Date(payload.ts),
    };
  },

  send: async () => undefined,
  user: {
    resolve: async ({ input }) => ({ id: input.userID }),
  },
  space: {
    create: async ({ input }) => ({ id: input.users[0]!.id }),
  },
});
```

Verify the raw delivery before parsing or returning provider data. A webhook-backed provider still needs a complete outbound `send` contract when the application must respond through the same platform.

## Registering and narrowing

Register custom platforms with `.config()` and narrow them exactly like built-in providers:

```ts
const app = await Spectrum({
  providers: [myPlatform.config({ apiKey: process.env.MY_KEY! })],
});

const mine = myPlatform(app);
const space = await mine.space.create(await mine.user("user-123"));
await space.send("Hello from my custom platform.");
```

## See also

- [Spectrum custom platform documentation](https://photon.codes/docs/spectrum-ts/custom-platforms)
- [`platform-narrowing.md`](./platform-narrowing.md) for narrowing behavior
- [`capability-semantics.md`](./capability-semantics.md) for unsupported send and resolver outcomes
- [`webhooks.md`](./webhooks.md) for Spectrum's request adapter
