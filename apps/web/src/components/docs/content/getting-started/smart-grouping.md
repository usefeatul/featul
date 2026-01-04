---
title: Smart grouping
description: Use boards, tags, and statuses to keep feedback organised at scale.
---

## Why grouping matters

As feedback volume grows it becomes hard to see patterns if everything sits in a single list. featul uses a combination of:

- **Boards** for high-level separation.
- **Tags** for flexible labelling.
- **Roadmap statuses** for delivery stages.

These are backed by:

- `board` and its `roadmapStatuses` configuration.
- `tag` and `postTag` in `@featul/db/schema/post.ts`.
- `post.roadmapStatus` and `post.status` fields.

## Grouping with boards

Boards are the first layer of grouping. Use them to separate:

- Product areas or modules.
- Public vs internal feedback.
- Roadmap, changelog, and idea intake.

Every post is linked to exactly one board via `post.boardId`.

## Grouping with tags

Tags are workspace-wide labels stored in the `tag` table. They are linked to posts through the `postTag` join table.

Typical examples:

- Segment (`SMB`, `Enterprise`, `Pro`, `Free`).
- Area (`Onboarding`, `Billing`, `Reporting`).
- Theme (`UX`, `Reliability`, `Performance`).

You can:

- Create and manage tags from feedback or settings screens.
- Attach multiple tags to a single post.
- Filter and sort lists of posts by tag.

## Grouping with statuses

Two status fields help you keep a clear picture:

- `post.status` – content lifecycle (`draft`, `published`, `archived`, `spam`, `pending_approval`).
- `post.roadmapStatus` – delivery stage on roadmap boards.

In the UI you will typically:

- Filter lists by roadmap status on roadmap views.
- Filter by post status when moderating or cleaning up content.

## De-duplicating related feedback

For overlapping feedback, featul uses the `postMerge` table:

- Group duplicate posts into a single primary request.
- Preserve metadata about consolidation (votes, comments, tags).

This keeps your grouping clean even when many customers ask for the same thing in different words.

