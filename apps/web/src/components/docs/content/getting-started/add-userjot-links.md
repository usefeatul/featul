---
title: Add UserJot links
description: Help users move from existing UserJot boards into your new featul portal.
---

## When this is useful

If you previously collected feedback in UserJot, you may want to:

- Keep legacy boards available for reference.
- Gradually move users toward your new featul workspace.
- Avoid breaking old email links or bookmarks immediately.

This page focuses on linking strategies rather than full data migration.

## Linking from UserJot to featul

The simplest way to transition users is to point existing UserJot surfaces to your new feedback portal:

- Add a **banner** or **pinned post** in UserJot that links to your featul workspace subdomain or custom domain.
- Use wording such as “New feedback portal” or “We’ve moved feedback to featul”.

On the featul side:

- Make sure you have at least one public board (`isPublic = true` in the `board` table).
- Consider a dedicated board for migrated or legacy feedback.

## Linking from featul back to UserJot

During a transition period you might also want to link back to existing UserJot content:

- Include a short section in your **Getting Started** or **Migration** posts with a link to the legacy board.
- Use regular markdown links in your posts, like `[View legacy board](https://...)`.

These links are purely navigational and do not require any special database fields. They are stored as part of the `post.content` field.

## Gradual migration

Over time you can:

- Recreate key categories and tags in featul using the `tag` and `postTag` tables.
- Re-enter or import high-value requests as new `post` records.
- Close down legacy boards once you are confident everything important has moved.

This approach lets you avoid a hard cut-over while still guiding users toward the new experience.

