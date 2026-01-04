---
title: Subdomain tracking
description: Route feedback through workspace subdomains and custom domains.
---

## Workspace subdomains

Every workspace has a unique `slug` in the `workspace` table (`@featul/db/schema/workspace.ts`). This slug is used to build default subdomains such as:

- `your-workspace.featul.com`

Routes in the app under `apps/app/src/app/[subdomain]/` use this slug to render:

- Public boards and requests.
- Roadmap and changelog pages.
- Request detail views with voting and comments.

## Custom domains

For branded portals you can attach custom domains using the `workspaceDomain` table:

- `host` – the full hostname (for example, `feedback.yourdomain.com`).
- `cnameName` and `cnameTarget` – CNAME details to point traffic to featul.
- `txtName` and `txtValue` – TXT record used for domain verification.
- `status` – one of `pending`, `verified`, or `error`.

The domain setup flow guides you through:

1. Adding DNS records with your provider.
2. Waiting for verification.
3. Serving your workspace under the verified domain.

## How tracking works

Regardless of whether traffic comes through a slug-based subdomain or a custom domain:

- Requests are scoped to a workspace via `workspaceId`.
- Boards, posts, tags, and comments always reference the workspace and board IDs.
- Activity records use the `activityLog` table with `workspaceId` to keep an audit trail.

This means you can safely:

- Run multiple workspaces side by side.
- Serve portals on different domains.
- Keep data separation and tracking intact.

