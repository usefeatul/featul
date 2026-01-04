---
title: Mask identities
description: Protect user privacy on public boards while keeping internal context.
---

## Identity controls

Boards include a `hidePublicMemberIdentity` flag in the `board` table (`@featul/db/schema/feedback.ts`):

- When `false`, public viewers can see member names or avatars on posts and comments (subject to your UI configuration).
- When `true`, public viewers see anonymised labels while internal members still see full details inside the app.

Posts and comments also carry identity fields:

- `post.authorId` references the user when available.
- `post.isAnonymous` indicates explicitly anonymous posts.
- `comment.authorId`, `comment.authorName`, and `comment.authorEmail` capture who wrote a comment.

## Enabling identity masking

1. Open **Settings → Boards**.
2. Select a public board.
3. Enable **Hide member identity on public views** (sets `hidePublicMemberIdentity` to true).
4. Save changes.

The public portal will:

- Avoid showing full member names or avatars for posts and comments.
- Still keep internal relationships intact for workspace members.

## How this works with anonymous feedback

Identity masking complements, rather than replaces, anonymous feedback:

- Use `allowAnonymous` and `post.isAnonymous` when you want entirely guest submissions.
- Use `hidePublicMemberIdentity` when authenticated members contribute but you do not want to expose who specifically requested or commented on a feature.

Together these options give you:

- Clean public boards that respect privacy.
- Enough internal context to follow up with the right users.

