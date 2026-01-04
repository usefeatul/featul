---
title: Publish updates
description: Share release notes and progress updates through a dedicated changelog.
---

## Changelog boards

Changelog boards use `systemType = 'changelog'` on the `board` table in `@featul/db/schema/feedback.ts`.

They are designed for:

- Public release notes.
- Internal change logs.
- Linking updates back to feedback and roadmap items.

Posts on a changelog board are regular entries in the `post` table, often with shorter, announcement-style content.

## Changelog tags

The `board` table includes a `changelogTags` JSON field, which lets you define reusable tags such as:

- Feature
- Improvement
- Fix
- Performance
- Security

These tags are used when you publish an update so readers can quickly scan the type of change.

## Creating a changelog entry

1. Open your workspace.
2. Navigate to your **Changelog** board or open **Settings → Changelog**.
3. Click **New entry**.
4. Provide:
   - A clear **title**.
   - A concise **summary** of what changed.
   - Optional **tags** from `changelogTags`.
5. Publish the entry.

This creates a `post` and optionally associated `postUpdate` record for the detailed content.

## Linking updates to feedback

When you ship a feature that originated from user feedback:

- Keep related requests in sync by updating their `roadmapStatus` (for example, to `Completed`).
- Reference relevant posts directly in the changelog content.
- Use `postUpdate` to maintain an audit trail of what changed and when.

Internally, these actions update:

- `post` rows for the affected requests.
- `postUpdate` rows for release notes.
- `activityLog` entries so you can see who published the change.

## Surfacing updates on your portal

Changelog boards can be exposed on:

- Your workspace subdomain (for example, `your-product.featul.com`).
- Custom domains configured via `workspaceDomain`.

This gives your users a single place to discover what changed and why, without needing a separate release notes tool.

