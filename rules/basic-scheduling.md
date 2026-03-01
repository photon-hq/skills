---
title: Basic Kit Scheduled Messages
impact: MEDIUM
impactDescription: Enables sending messages at a future time or on a recurring schedule.
tags: [basic, schedule, cron, reminder, future]
---

## Basic Kit: Scheduled Messages

The Basic Kit includes two powerful classes for scheduling messages: `MessageScheduler` for cron-based jobs and `Reminders` for human-friendly, natural language scheduling.

### Using `MessageScheduler` for Cron-like Jobs

`MessageScheduler` is ideal for programmatic, recurring messages, such as daily reports or hourly check-ins.

**1. Initialize the Scheduler:**

```typescript
import { IMessageSDK, MessageScheduler } from "@photon-ai/imessage-kit";
const sdk = new IMessageSDK();
const scheduler = new MessageScheduler(sdk);
```

**2. Schedule a One-Time Message:**

Use the `schedule` method with a specific `sendAt` date.

```typescript
scheduler.schedule({
    to: "+15551234567",
    content: "Your one-time appointment reminder for 3 PM.",
    sendAt: new Date("2026-08-15T15:00:00"),
});
```

**3. Schedule a Recurring Message:**

Use `scheduleRecurring` with an `interval` (`hourly`, `daily`, `weekly`, `monthly`).

```typescript
scheduler.scheduleRecurring({
    to: "+15551234567",
    content: "This is your daily report summary.",
    startAt: new Date(), // Optional: when to start the schedule
    interval: "daily",
});
```

**4. Clean Up:**

Always call `destroy` to clear any pending timers when your application shuts down.

```typescript
scheduler.destroy();
```

### Using `Reminders` for Natural Language Scheduling

`Reminders` provides a human-friendly API for setting reminders using natural language, powered by the `chrono-node` library.

**1. Initialize the Reminders Class:**

```typescript
import { IMessageSDK, Reminders } from "@photon-ai/imessage-kit";
const sdk = new IMessageSDK();
const reminders = new Reminders(sdk);
```

**2. Set a Reminder `in` a Timeframe:**

```typescript
reminders.in("15 minutes", "+15551234567", "Your meeting with marketing starts soon.");
reminders.in("2 hours", "+15551234567", "Don't forget to pick up groceries.");
```

**3. Set a Reminder `at` a Specific Time:**

```typescript
reminders.at("tomorrow at 9:30am", "+15551234567", "Project stand-up call.");
reminders.at("August 20th 5pm", "+15551234567", "Submit your expense report.");
```

**4. Clean Up:**

Like the scheduler, the `Reminders` instance must be destroyed to clean up timers.

```typescript
reminders.destroy();
```
