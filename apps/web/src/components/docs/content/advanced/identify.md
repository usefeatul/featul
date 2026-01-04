---
title: Identify users
description: Link feedback to user accounts while respecting privacy settings.
---

## User identity in the database

User accounts live in the `user` table in `@featul/db/schema/auth.ts`. Feedback objects reference users where appropriate:

- `workspace.ownerId` points to the workspace owner.
- `workspaceMember.userId` links members to users.
- `post.authorId` references the user who created a request.
- `comment.authorId` references the user who wrote a comment.

These references allow you to:

- Filter feedback by customer.
- See which team member responded or updated a request.
- Power notifications and activity summaries.

## Anonymous vs identified posts

Posts and comments carry explicit anonymity flags:

- `post.isAnonymous` for posts.
- `comment.isAnonymous` for comments.

When a user is signed in and not posting anonymously:

- `authorId` is set to their user id.
- Name and avatar are resolved from the user profile.

When a user posts anonymously:

- `authorId` may be omitted.
- Public views rely on generic labels such as “Guest” or “Anonymous”.

Board-level options like `hidePublicMemberIdentity` control how much identity is exposed on public portals.

## Identifying users from your product

In many setups you will:

- Authenticate users in your own app.
- Mount a feedback widget or link to a feedback portal.
- Pass user identifiers into the widget or feedback creation calls.

This information is stored via `authorId` on posts and comments so you can later:

- Filter feedback by plan, segment, or account.
- Follow up with specific users when features ship.

Always make sure your implementation respects:

- Your privacy policy.
- GDPR or other regional requirements.

