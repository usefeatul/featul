---
title: Private boards
description: Run internal feedback and prioritisation on boards that users cannot see.
---

## Public vs private

Each board in the `board` table has two flags that control exposure:

- `isPublic` – whether the board is accessible on your public feedback portal.
- `isVisible` – whether the board appears in navigation, even if it is public.

A **private board** is simply a board with `isPublic = false`. Only authenticated workspace members can access it through the internal app.

You can also create “hidden public” boards by setting `isPublic = true` and `isVisible = false`, which lets you share a direct link without listing the board everywhere.

## Creating a private board

1. Open your workspace.
2. Go to **Settings → Boards**.
3. Create a new board or edit an existing one.
4. Turn off the **Public** option so `isPublic` is false.
5. Save changes.

From this point:

- New posts on the board are only visible to workspace members.
- Public users will not see the board listed or be able to submit feedback to it.

## Use cases

Private boards work well for:

- Internal feedback from customer-facing teams.
- Backlog grooming and triage discussions.
- Experiments and early-stage ideas that you are not ready to share.

All posts and comments still use the regular `post` and `comment` tables. The difference is that access is enforced at the board level based on `isPublic` and the current user’s membership.

## Converting boards later

You can switch a board from private to public (or the reverse) at any time:

- Changing `isPublic` updates who can read and create posts.
- Existing posts remain on the board; only visibility changes.

This lets you start with a private board while you refine your workflow and then open it up once you are ready to share more with customers.

