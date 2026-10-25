---
title: REST API
description: Create and update changelog entries from CI/CD, scripts, or your own tools.
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

## Errors

Errors return a status code and a JSON body:

```json
{ "error": { "code": "unknown_tags", "message": "Unknown changelog tags: Beta. Available tags: Fix, New" } }
```

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | `invalid_request`, `invalid_json`, `unknown_tags` | The body or query is invalid. The message says which field. |
| 401 | `unauthorized` | Missing, revoked, or expired key, or its creator lost access. |
| 403 | `plan_required`, `limit_reached`, `insufficient_scope` | The plan doesn't include the API, the changelog entry limit is reached, or the key can't do this. |
| 404 | `not_found` | No entry with that id in this workspace. |
| 429 | `rate_limited` | More than 60 requests a minute for this key (or 300 from one IP address). Wait for `Retry-After` seconds. |

## Next steps

- [Publish releases from GitHub Actions](/docs/developers/github-actions)
- [Publish updates](/docs/getting-started/publish-updates) from the app
