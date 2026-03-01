---
title: Basic Kit Setup & Configuration
impact: HIGH
impactDescription: Required for any Basic Kit functionality.
tags: [basic, setup, installation, configuration]
---

## Basic Kit: Setup and Configuration

This guide covers the installation and configuration of the Basic iMessage Kit (`@photon-ai/imessage-kit`).

### Installation

Installation requirements differ based on the runtime environment.

**For Bun (zero external dependencies):**
```bash
bun add @photon-ai/imessage-kit
```

**For Node.js (requires `better-sqlite3`):**
```bash
npm install @photon-ai/imessage-kit better-sqlite3
```

### Initializing the SDK

Import and create an instance of the `IMessageSDK`.

```typescript
import { IMessageSDK } from "@photon-ai/imessage-kit";

const sdk = new IMessageSDK();
```

### Configuration Options

You can pass a configuration object to the constructor to customize its behavior.

```typescript
import { IMessageSDK, Plugin } from "@photon-ai/imessage-kit";

const config = {
    debug: true,                          // Enable debug logging
    maxConcurrent: 5,                     // Max concurrent sends (default: 5)
    scriptTimeout: 10000,                 // AppleScript timeout in ms (default: 10000)
    databasePath: "/custom/path/chat.db", // Custom iMessage database path
    plugins: [] as Plugin[],              // Array of plugins
    watcher: {
        pollInterval: 1500,               // Polling interval in ms (default: 2000)
        unreadOnly: false,                // Only watch for unread messages (default: false)
        excludeOwnMessages: true,         // Exclude messages sent by you (default: true)
    },
    webhook: {
        url: "https://your-webhook-url.com/hook",
        headers: { "Authorization": "Bearer your-token" },
    },
};

const sdk = new IMessageSDK(config);
```

### Closing the Connection

It is crucial to close the SDK connection to release the database lock and ensure a graceful shutdown.

```typescript
try {
  // Your application logic here
} finally {
  await sdk.close();
  console.log("SDK connection closed.");
}
```
