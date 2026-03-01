---
title: Advanced Kit Setup & Connection
impact: HIGH
impactDescription: Required for any Advanced Kit functionality.
tags: [advanced, setup, installation, connection, server]
---

## Advanced Kit: Setup and Connection

The Advanced iMessage Kit (`@photon-ai/advanced-imessage-kit`) uses a client-server architecture. This guide covers setting up the SDK to connect to your Advanced Kit server.

### Prerequisites

You must have an Advanced Kit server instance running and accessible. The server provides the WebSocket endpoint and API key required by the SDK.

### Installation

```bash
npm install @photon-ai/advanced-imessage-kit
# or
bun add @photon-ai/advanced-imessage-kit
```

### Initializing the SDK

Import the `SDK` factory function and call it with your server URL and API key.

```typescript
import { SDK } from "@photon-ai/advanced-imessage-kit";

const sdk = SDK({
  serverUrl: "http://localhost:1234", // The URL of your Advanced Kit server
  apiKey: "your-secret-api-key",       // The API key for authentication
  logLevel: "info",                   // Optional: 'debug', 'info', 'warn', 'error'
});
```

### Connecting to the Server

Before you can perform any operations, you must establish a WebSocket connection to the server and wait for the `ready` event.

```typescript
async function main() {
    // Handle connection events
    sdk.on("ready", () => {
        console.log("SDK is connected and ready to use.");
        // You can now start sending messages or listening for events
    });

    sdk.on("disconnect", () => {
        console.warn("SDK disconnected from the server.");
        // Implement reconnection logic if needed
    });

    sdk.on("error", (error) => {
        console.error("An SDK error occurred:", error);
    });

    // Establish the connection
    try {
        await sdk.connect();
    } catch (error) {
        console.error("Failed to connect to the server:", error);
    }
}

main();
```

### Graceful Shutdown

Always close the connection when your application is shutting down.

```typescript
process.on("SIGINT", async () => {
    console.log("Shutting down...");
    await sdk.close();
    process.exit(0);
});

// In a long-running process, you can also call close() manually
// await sdk.close();
```
