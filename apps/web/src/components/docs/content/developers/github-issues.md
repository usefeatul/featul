---
title: GitHub Issues
description: Link requests to GitHub issues and keep their roadmap status in sync automatically.
---

## Overview

Mention a feedback request in a GitHub issue, and Featul moves the request along your roadmap as the issue changes. Voters get the same status emails as when you change the status by hand. Available on Starter and Professional; workspace owners and admins set it up.

Featul only reads from GitHub. Changing a status in Featul never edits the issue.

## Connect GitHub

1. Open **Settings → Integrations** and click **Connect** on the GitHub card.
2. Install the Featul GitHub App on your account or organization and pick the repositories to share.
3. Approve the authorization step. Featul only follows repositories you can access.
4. Turn on **Update roadmap status** on the GitHub card. Until you do, issues are linked but statuses don't change.

The Help Center uses the same connection to import docs from GitHub, so you connect once.

## Link a request

Paste the request's link anywhere in a GitHub issue description:

```text
Customers asked for this: https://acme.featul.com/board/p/dark-mode
```

Both kinds of request link work: the public one (your Featul subdomain or custom domain) and the one from the app (`app.featul.com/workspaces/acme/requests/...`). One issue can mention several requests.

The description is the source of truth. Remove the link from the issue and the request is unlinked. If a request is mentioned by more than one issue, it follows the one whose description mentioned it most recently.

Only people with triage access or more to the repository (and Apps your admins installed) can link requests or move their status. On a public repository, anyone can open an issue, but their links and their own closes don't affect your roadmap until a maintainer edits the issue.

**Settings → Integrations → Linked issues** lists every linked request. Unlink one from its menu. If the issue description still has the link, the next edit to that issue links it again, so remove it there too.

## How statuses map

| On GitHub | Roadmap status |
| --- | --- |
| Open | Planned (or Review, see below) |
| Open with an in-progress label | In progress |
| Closed as completed | Completed |
| Closed as not planned or duplicate | Closed |

Change the defaults on the GitHub card in **Settings → Integrations**:

- **Update roadmap status**: turn this off to keep issues linked without changing statuses.
- **Open issues**: whether open issues show as Planned or Review.
- **In progress labels**: labels that mean work has started. Matching ignores case, spaces, dashes, and underscores, so `in-progress` matches `In Progress`.

Status updates show in the request's activity as **GitHub**.

## Sync with GitHub

Featul hears about issue changes from GitHub as they happen. Click **Sync** on **Linked issues** to read the connected repositories' issues from GitHub again. Use it:

- **Right after connecting**, to link issues that already mention requests.
- **If a status looks out of date**, for example when GitHub couldn't reach Featul for a while.

Sync reads up to 10,000 of the newest issues across your repositories, starting with the ones that already have links. If a repository has more, Featul tells you, and only its newest issues are checked. Issues that were deleted or moved to another repository are unlinked, and a request already following an issue stays with it. Only issues written by people with triage access or more are applied; others are kept up to date as they change. You can sync a few times every 10 minutes.

## Troubleshooting

**A link didn't work**: check that the repository is shared with the Featul GitHub App and that GitHub is connected in Settings, then click **Sync**. Links in issues opened by someone outside the repository only count after a maintainer edits the issue description.

**Statuses don't change**: turn on **Update roadmap status** on the GitHub card.

## Related

- [Publish changelog entries from CI](/docs/developers/github-actions)
- [Plan your roadmap](/docs/getting-started/plan-roadmap)
