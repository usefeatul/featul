# Featul changelog action

Create or update a [Featul](https://featul.com) changelog entry from GitHub Actions, for example on every release.

```yaml
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

On release events the release name, notes, and tag fill in `title`, `content`, and `external-id`. Re-running with the same `external-id` updates the entry instead of creating a duplicate.

See the [GitHub Actions guide](https://featul.com/docs/developers/github-actions) for every input and the [REST API docs](https://featul.com/docs/developers/api).
