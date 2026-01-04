---
title: Plan roadmap
description: Turn feedback into an actionable roadmap with clear statuses.
---

## Roadmap boards

Roadmap boards are regular boards with `systemType = 'roadmap'` in the `board` table (`@featul/db/schema/feedback.ts`).

They are designed to show where requests sit in your product development funnel, from idea to shipped.

Each post has:

- A **board** via `post.boardId`.
- An optional **roadmap status** via `post.roadmapStatus`.

The roadmap view groups posts into columns based on `roadmapStatuses` configured on the board.

## Default stages

By default, a roadmap board ships with the following statuses stored in the `roadmapStatuses` JSON field:

- `Pending`
- `Review`
- `Planned`
- `Progress`
- `Completed`
- `Closed`

Each status has an id, name, color, and sort order that the UI uses to render columns and badges.

## Configuring your roadmap

1. Open your workspace.
2. Go to **Settings → Boards** and select your roadmap board.
3. Edit the **Roadmap statuses**:
   - Rename stages to match your process.
   - Change colors to align with your brand.
   - Reorder stages to fit how you work.
4. Save changes.

The updated JSON structure is stored directly on the board and used wherever roadmap status is displayed: board views, request cards, and detail pages.

## Moving requests through the roadmap

From the roadmap UI you can:

- Drag and drop posts between columns.
- Update `post.roadmapStatus` via dropdowns or actions.
- Pin or feature key requests to keep them visible.

Each change is logged as part of your activity history in the `activityLog` table, so you can audit who changed what and when.

## Connecting roadmap and changelog

When a request is moved to a “Completed” or “Closed” state you can:

- Link it to a changelog entry using `postUpdate` records.
- Publish a public update on your changelog board.

This keeps the roadmap, feedback, and release notes aligned without duplicating work.

