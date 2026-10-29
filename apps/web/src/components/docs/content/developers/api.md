---
title: REST API
description: Publish changelog entries and triage feedback from CI/CD, scripts, or your own tools.
---

## Overview

The Featul REST API lets you publish changelog entries without opening the app, for example when a release ships. It's available on Starter and Professional.

All requests go to `https://api.featul.com/v1` and send and return JSON. If you self-host Featul, use your app's address with `/api/v1`, for example `https://featul.yourcompany.com/api/v1`.

## Authentication

Workspace owners and admins can create a key in **Settings → Integrations → API keys**. The key is shown once, so store it as a secret right away (for example `FEATUL_API_KEY` in GitHub Actions).

Send the key in the `Authorization` header:

```bash
curl https://api.featul.com/v1/changelog \
  -H "Authorization: Bearer $FEATUL_API_KEY"
```

A key belongs to one workspace and acts as the person who created it. Entries it creates are credited to that person. If they leave the workspace or stop being an owner or admin, the key stops working. Create a new one from an account that still has access.

Revoke a key from the same settings page. Anything using it stops working immediately.

## Create or update an entry

`POST /v1/changelog`

```bash
curl -X POST https://api.featul.com/v1/changelog \
  -H "Authorization: Bearer $FEATUL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Faster search",
    "content": "## Improvements\n\n- Search results load twice as fast.",
    "tags": ["Improvement"],
    "status": "published",
    "externalId": "v2.4.0"
  }'
```

| Field | Type | Description |
| --- | --- | --- |
| `title` | string, required | Up to 256 characters. |
| `content` | string | Markdown body. Headings, lists, links, code blocks, and HTTPS images are supported. |
| `summary` | string | Shown in lists and emails. Defaults to the start of the body. |
| `tags` | string[] | Changelog tag names. Tags must already exist (create them in **Settings → Changelog**). |
| `status` | `draft` or `published` | Defaults to `draft`. Publishing emails changelog subscribers. |
| `scheduledAt` | ISO 8601 date | Publish a draft automatically at this time. Only drafts can be scheduled. |
| `externalId` | string | Your own id for this update, like a release tag or commit SHA. |
| `relatedFeedbackIds` | string[] | Up to 20 feedback post ids this update ships. They're linked from the published entry. |

### Safe retries with externalId

When you send an `externalId` that already exists, Featul updates that entry instead of creating a new one. Re-running a release workflow or retrying a failed request never creates duplicates. Without `externalId`, every request creates a new entry.

The response is `201 Created` for a new entry and `200 OK` for an update.

```json
{
  "data": {
    "id": "k3x9...",
    "title": "Faster search",
    "slug": "faster-search-m2f1a",
    "status": "published",
    "summary": "Search results load twice as fast.",
    "tags": ["Improvement"],
    "externalId": "v2.4.0",
    "url": "https://acme.featul.com/changelog/p/faster-search-m2f1a",
    "publishedAt": "2026-10-25T12:00:00.000Z",
    "scheduledAt": null,
    "createdAt": "2026-10-25T12:00:00.000Z",
    "updatedAt": "2026-10-25T12:00:00.000Z"
  }
}
```

`url` uses your custom domain when one is set. It's `null` for drafts.

## Update an entry

`PATCH /v1/changelog/:id`

Send only the fields you want to change. Send `"scheduledAt": null` to clear a schedule. For example, publish a draft:

```bash
curl -X PATCH https://api.featul.com/v1/changelog/k3x9... \
  -H "Authorization: Bearer $FEATUL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "status": "published" }'
```

## Get an entry

`GET /v1/changelog/:id`

## List entries

`GET /v1/changelog`

| Query parameter | Description |
| --- | --- |
| `status` | `draft` or `published`. |
| `externalId` | Find the entry created with this `externalId`. |
| `limit` | 1 to 100, default 20. |
| `offset` | Skip this many entries, default 0. |

Entries are newest first. The response is `{ "data": { "entries": [...], "hasMore": true } }`.

## Feedback

Read and triage feedback posts. Keys created before feedback access was added only have changelog access; create a new key to use these endpoints.

`GET /v1/workspace` returns your feedback boards, the roadmap statuses with post counts, and your tags.

`GET /v1/feedback` lists posts, newest first. Query parameters:

| Parameter | Description |
| --- | --- |
| `board` | Board slugs, comma-separated. |
| `status` | Roadmap statuses, comma-separated: `pending`, `review`, `planned`, `progress`, `completed`, `closed`. |
| `tag` | Tag names or slugs, comma-separated. Posts with any of them match. |
| `untagged` | `true` for posts without tags. |
| `includeSnoozed` | `true` to include snoozed posts, which are hidden by default. |
| `search` | Text in the title or description. |
| `state` | `published` (default), `pending_approval`, `archived`, or `spam`. |
| `createdAfter`, `updatedAfter` | ISO 8601 dates. Any change counts as an update, including votes and comments. |
| `completedAfter` | ISO 8601 date. Posts moved to `completed` since then, for example since your last release. |
| `notInChangelog` | `true` to leave out posts already linked from a changelog entry. |
| `sort` | `newest` (default), `oldest`, `votes`, `comments`, or `updated`. |
| `limit`, `offset` | 1 to 100 (default 25), and how many to skip. |

`GET /v1/feedback/:id` returns one post with its full description and comments, internal notes included.

`PATCH /v1/feedback/:id` triages a post. Send any of `status`, `title`, `board` (a board slug), and either `tags` (replaces every tag) or `addTags` / `removeTags`. Voters are notified of status changes, the same as in the app.

```bash
curl -X PATCH https://api.featul.com/v1/feedback/POST_ID \
  -H "Authorization: Bearer $FEATUL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "status": "planned", "addTags": ["UI"] }'
```

`POST /v1/feedback/:id/merge` with `{ "targetId": "...", "reason": "..." }` merges a duplicate into another post. Votes, comments, and tags move to the target, and the duplicate is archived. The target must be published, and a post that's already been merged can't be merged again.

`POST /v1/feedback/:id/comments` with `{ "content": "...", "internal": true }` adds a comment from the key's creator. Comments are internal notes unless you send `"internal": false`. Like in the app, you can't comment on locked posts or on boards with comments turned off.

## Errors

Errors return a status code and a JSON body:

```json
{ "error": { "code": "unknown_tags", "message": "Unknown changelog tags: Beta. Available tags: Fix, New" } }
```

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | `invalid_request`, `invalid_json`, `unknown_tags`, `unknown_board`, `unknown_feedback`, `invalid_target` | The body or query is invalid. The message says which field. |
| 401 | `unauthorized` | Missing, revoked, or expired key, or its creator lost access. |
| 403 | `plan_required`, `limit_reached`, `insufficient_scope` | The plan doesn't include the API, the changelog entry limit is reached, or the key can't do this. |
| 403 | `comments_disabled`, `post_locked` | The board doesn't allow comments, or the post is locked. |
| 404 | `not_found` | No entry or post with that id in this workspace. |
| 409 | `already_merged` | The post has already been merged into another one. |
| 429 | `rate_limited` | More than 60 requests a minute for this key (or 300 from one IP address). Wait for `Retry-After` seconds. |

## Next steps

- [Connect Claude or Cursor with the MCP server](/docs/developers/mcp)
- [Publish releases from GitHub Actions](/docs/developers/github-actions)
- [Publish updates](/docs/getting-started/publish-updates) from the app
