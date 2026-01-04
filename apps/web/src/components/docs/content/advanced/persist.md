---
title: Persist data
description: Understand how featul stores workspaces, feedback, and activity over time.
---

## Core persistence model

featul uses PostgreSQL (via Drizzle ORM in `@featul/db`) to persist everything in your workspace:

- Workspaces and domains.
- Members, invites, and branding.
- Boards, posts, tags, and votes.
- Comments, reactions, and mentions.
- Activity logs and reports.

Key tables include:

- `workspace` and `workspaceDomain` in `@featul/db/schema/workspace.ts`.
- `board` in `@featul/db/schema/feedback.ts`.
- `post`, `tag`, `postTag`, `postUpdate`, `postReport`, `postMerge`, and `activityLog` in `@featul/db/schema/post.ts`.
- `comment`, `commentReaction`, `commentMention`, and `commentReport` in `@featul/db/schema/comment.ts`.
- `brandingConfig` in `@featul/db/schema/branding.ts`.

Each table uses `createdAt` and `updatedAt` timestamps so you can audit when records were created and last changed.

## Workspace lifecycle

When you create a workspace:

- A row is created in `workspace` with name, slug, domain, plan, and theme.
- Branding defaults are stored in `brandingConfig`.
- The owner is linked via `ownerId` and `workspaceMember` records.

Workspaces can also reserve slugs ahead of time using `workspaceSlugReservation` in `@featul/db/schema/reservation.ts`. This makes sure a desired slug is not taken while a user completes sign‑up.

## Feedback and comments

Feedback is stored in the `post` table:

- `boardId` ties the post to a specific board.
- `title`, `content`, and optional `image` hold the main body of the request.
- `status` and `roadmapStatus` track moderation and delivery stages.
- `metadata` provides a flexible JSON field for attachments, integrations, and custom fields.

Comments are stored in the `comment` table with:

- `postId` pointing to the parent request.
- `parentId` for nested threads.
- `content` with the comment text.
- `status`, `isPinned`, and `isEdited` for moderation and presentation.

Reactions and mentions are tracked in dedicated tables so you can keep a clean audit trail and avoid double‑counting.

## Activity and moderation history

Important actions across the app are recorded in `activityLog`:

- Each row includes `workspaceId`, `userId`, `action`, `actionType`, `entity`, and `entityId`.
- Optional `metadata` gives extra detail, such as previous and new statuses.

Reports for posts and comments are stored in `postReport` and `commentReport`:

- `reason`, `status`, and `resolution` fields help you manage moderation workflows.
- `reviewedBy` and `reviewedAt` track who handled each report.

## Why this matters for you

Because all of this data is persisted in well‑structured tables, you can:

- Rely on **consistent history** for requests, comments, and updates.
- Build exports, analytics, or custom dashboards on top of the same schema.
- Confidently self‑host or migrate data in the future if needed.

