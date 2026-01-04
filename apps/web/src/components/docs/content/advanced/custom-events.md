---
title: Custom events
description: Attach structured context to feedback using metadata and activity logs.
---

## Why custom events

Beyond simple posts and votes, many teams want to attach structured context to feedback, such as:

- Which plan or segment a user is on.
- Where in the product a request originated.
- Which internal system or ticket it relates to.

featul supports this through flexible metadata fields and an activity log.

## Post metadata

The `post` table in `@featul/db/schema/post.ts` includes a `metadata` JSON field with optional properties:

- `attachments` – files or links associated with a request.
- `integrations` – references to systems such as GitHub or Jira.
- `customFields` – arbitrary key–value pairs.

You can use `customFields` to persist additional context for a post, for example:

```json
{
  "source": "in_app_widget",
  "plan": "professional",
  "featureArea": "billing"
}
```

These fields are available to your application code when rendering requests, building filters, or exporting data.

## Activity log

The `activityLog` table records events that happen inside a workspace:

- `action` and `actionType` describe what occurred.
- `entity` and `entityId` point to the affected object (for example `post` or `comment`).
- `metadata` holds additional event-specific context.

This lets you:

- Track when roadmap statuses change.
- Capture moderation and merge actions.
- Analyse how feedback flows through your process over time.

## Designing your own event schema

Because both `post.metadata` and `activityLog.metadata` are JSON fields, you can define your own structure per workspace or integration. A common pattern is to:

- Keep top-level keys stable (for example `source`, `segment`, `featureArea`).
- Nest integration-specific payloads under namespaced keys (for example `jira`, `github`).

This gives you a consistent way to reason about custom events without having to alter the underlying database schema.

