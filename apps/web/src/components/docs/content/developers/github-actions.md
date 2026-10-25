---
title: GitHub Actions
description: Publish a changelog entry every time you ship a GitHub release.
---

## Before you start

1. Create an API key in **Settings → Integrations → API keys**.
2. In your GitHub repository, open **Settings → Secrets and variables → Actions** and add it as `FEATUL_API_KEY`.

## Publish on every release

Add `.github/workflows/changelog.yml`:

```yaml
name: Changelog

on:
  release:
    types: [published]

jobs:
  featul:
    runs-on: ubuntu-latest
    steps:
      - uses: usefeatul/featul/actions/changelog@main
        with:
          api-key: ${{ secrets.FEATUL_API_KEY }}
```

On a release event, the action uses the release name as the title, the release notes as the body, and the tag as the `externalId`. Editing the release and running the workflow again updates the same entry instead of adding a new one.

## Options

```yaml
- uses: usefeatul/featul/actions/changelog@main
  with:
    api-key: ${{ secrets.FEATUL_API_KEY }}
    title: Faster search
    content-file: CHANGELOG-next.md
    tags: Improvement, Performance
    status: draft
    external-id: ${{ github.sha }}
```

| Input | Description |
| --- | --- |
| `api-key` | Required. Your Featul API key. |
| `title` | Defaults to the release name or tag. |
| `content` | Markdown body. Defaults to the release notes. |
| `content-file` | Read the body from a Markdown file instead. |
| `summary` | Short summary for lists and emails. |
| `tags` | Comma-separated changelog tag names that already exist in Featul. |
| `status` | `published` (default) or `draft`. Drafts let you review the entry in Featul before publishing. |
| `external-id` | Defaults to the release tag. Reusing an id updates that entry. |
| `api-url` | API base URL. Defaults to `https://api.featul.com/v1`. Self-hosted: `https://your-app/api/v1`. |

The action outputs `entry-id`, `entry-url`, and `created` (`true` for a new entry) for later steps.

## Other CI providers

The action is a thin wrapper around the [REST API](/docs/developers/api). In GitLab CI, CircleCI, or any other runner, call it with `curl`:

```bash
curl -X POST https://api.featul.com/v1/changelog \
  -H "Authorization: Bearer $FEATUL_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg title "$CI_COMMIT_TAG" --rawfile content RELEASE_NOTES.md \
        '{title: $title, content: $content, status: "published", externalId: $title}')"
```
