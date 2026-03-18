# GitHub Issue Sync + AI Roadmap Suggestions (V1)

## Summary

Featul will support a one-way GitHub App integration where selected GitHub issues are synced into feedback posts, and AI suggests roadmap statuses for manual review.

### Locked defaults

- Sync model: one-way GitHub -> Featul
- Auth model: GitHub App
- Scope: single repository per workspace
- Issue filter: label allowlist only
- Backfill window: 180 days
- Content sync: issue title/body only (no comments)
- Target board: dedicated non-system board `GitHub Issues` (`github-issues`)
- AI behavior: suggest-only (no auto-apply)

## Data Model

### `workspace_github_connection`

Stores one active GitHub sync configuration per workspace.

- `workspace_id` unique
- GitHub installation + selected repository
- Label allowlist
- Optional deterministic status label map
- Target board id for synced posts
- Active flag + last sync timestamp

### `github_issue_link`

Stores per-issue linkage and suggestion state.

- Unique by `(workspace_id, repository_id, issue_id)`
- Unique by `(workspace_id, post_id)`
- Issue state/labels snapshot
- Suggested roadmap status + confidence/reason + state
- Content conflict fields

## API Endpoints (Integration Router)

- `githubConnectionGet`
- `githubConnectStart`
- `githubConnectionComplete`
- `githubSelectRepo`
- `githubSyncNow`
- `githubSuggestionsList`
- `githubSuggestionApply`
- `githubDisconnect`

## Public Routes

- `POST /api/integrations/github/webhook`
- `GET /api/integrations/github/setup`

## Sync Rules

- Ignore pull requests
- Sync only issues containing at least one allowlisted label
- Create/update post metadata with `metadata.integrations.github = issueUrl`
- Detect conflicts when synced content diverges from last synced hashes
- Never auto-apply roadmap status; always store suggestion as pending

## Suggestion Strategy

1. Deterministic first (label map, issue state/reason)
2. AI fallback via OpenRouter (if configured)
3. Safe fallback to `pending`

## Security

- Plan-gated (Starter/Professional)
- Owner/admin permission checks
- Signed setup `state` token
- GitHub webhook HMAC verification
- No PAT/OAuth token storage for user accounts

## Observability

Activity log actions:

- `github_repo_selected`
- `github_sync_started`
- `github_sync_completed`
- `github_sync_failed`
- `github_suggestion_accepted`
- `github_suggestion_rejected`
- `github_disconnected`

Each sync activity includes counts (`created`, `updated`, `skipped`, `suggested`, `conflicts`) and cursor metadata.

## QA Scenarios

- Connect app, select repo, set allowlist, and run backfill
- Verify only allowlisted issues are imported
- Verify no duplicate posts on re-sync
- Verify suggestion queue allows accept/reject
- Verify manual post edits trigger conflict behavior
- Verify invalid webhook signature is rejected
