---
title: Create boards
description: Structure feedback into focused boards for roadmap, changelog, and ideas.
---

## How boards work

Boards are the main way you group feedback in featul. Each board corresponds to a row in the `board` table in `@featul/db/schema/feedback.ts` and belongs to a single workspace.

A board defines:

- **Name and slug** – shown in the UI and used in URLs.
- **Privacy** – `isPublic` controls whether the board is accessible on your public portal.
- **Visibility** – `isVisible` controls whether a public board is listed in navigation.
- **System type** – `systemType` is used for special boards like `roadmap` and `changelog`.
- **Behaviour flags** – `allowAnonymous`, `allowComments`, and `hidePublicMemberIdentity`.
- **Roadmap and changelog config** – `roadmapStatuses` and `changelogTags`.

## Creating a new board

1. Open your workspace in the app.
2. Go to **Settings → Boards**.
3. Click **Create board**.
4. Choose a **name** and **slug**. The slug must be unique within the workspace (`board_slug_workspace_unique` in the database).
5. Decide whether the board should be:
   - **Public** (customers can view and submit posts).
   - **Internal only** (team feedback or private triage).
6. Choose whether this board should behave like:
   - A **regular feedback board** (no `systemType`).
   - A **roadmap board** (`systemType = 'roadmap'`).
   - A **changelog board** (`systemType = 'changelog'`).
7. Configure whether you allow anonymous posts and comments.

When you save, featul writes a `board` record with your chosen settings and default roadmap statuses and changelog tags.

## Default roadmap statuses

Roadmap-enabled boards use the `roadmapStatuses` JSON field on the `board` table. By default this includes:

- `Pending`
- `Review`
- `Planned`
- `Progress`
- `Completed`
- `Closed`

You can adjust the order and naming from the workspace settings UI. Changes are saved back to the same JSON structure so the roadmap board can render consistent columns.

## Connecting boards to posts

Every piece of feedback (`post` table) belongs to a single board via `post.boardId`. When you create a post from a public portal or the internal app:

- The app sets `boardId` to the selected board.
- Board-level settings like `allowAnonymous`, `allowComments`, and `hidePublicMemberIdentity` determine how the post behaves.

Use multiple boards to separate:

- Product lines or modules.
- Public feedback vs. internal triage.
- Roadmap and changelog streams.

