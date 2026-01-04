---
title: Guest feedback
description: Collect feedback from guests without forcing account creation.
---

## Anonymous feedback settings

Guest feedback is controlled at the board level using these fields on the `board` table in `@featul/db/schema/feedback.ts`:

- `allowAnonymous` – whether guests can submit posts without signing in.
- `allowComments` – whether comments are allowed on the board at all.

Posts and comments also track anonymity:

- `post.isAnonymous` in `post`.
- `comment.isAnonymous` in `comment`.

## Enabling guest submissions

1. Open **Settings → Boards**.
2. Choose a public board where you want to allow guest feedback.
3. Enable **Allow anonymous submissions** so `allowAnonymous` is true.
4. Decide whether to keep comments open via `allowComments`.

Once enabled:

- Guests can submit posts without an account.
- The system stores basic author context (like name or email if you request it) alongside the post.
- `isAnonymous` is used to control how much identity is shown on public boards.

## Moderation and quality

Even with guest access, moderation tools remain available:

- `post.status` can be set to `pending_approval`, `spam`, or `archived`.
- `comment.status` supports `pending`, `spam`, `deleted`, and `hidden`.
- `postReport` and `commentReport` tables track reports and resolutions.

Use these tools to keep your public boards healthy while still lowering friction for new feedback.

## When to use guest feedback

Guest feedback is useful when:

- You want a very low-friction entry point to collect ideas.
- You are early in the product lifecycle and do not want to require login.
- You are capturing feedback from marketing pages or embedded widgets.

For high-sensitivity boards (for example, security or private roadmap), keep `allowAnonymous` disabled so that only signed-in users can contribute.

