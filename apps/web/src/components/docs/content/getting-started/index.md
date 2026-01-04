---
title: Getting started with featul
description: Understand the core pieces of featul and how they fit together.
---

## What featul gives you

featul is a workspace for collecting user feedback, prioritising requests, and publishing roadmap updates in one place.

Under the hood there are a few core concepts:

- **Workspaces** group everything for a product or company.
- **Boards** organise feedback into public or private spaces.
- **Posts** represent individual requests, ideas, or changelog entries.
- **Members** collaborate on review, triage, and delivery.

Most of what you see in the app is backed by the database tables in `@featul/db`, for example:

- `workspace` stores basic workspace info, plan, theme, and domain details.
- `board` configures how each board behaves, including privacy and roadmap options.
- `post` holds the actual feedback, status, and metadata.
- `workspace_member` and `workspace_invite` keep track of team access and roles.

## Recommended first steps

1. **Create your first workspace**  
   Sign in to the app and create a workspace for your product. This creates entries in the `workspace` table and sets up default settings for branding and roadmap behaviour.

2. **Create at least one public board**  
   Use the workspace settings to create a feedback board. Under the hood this is a row in the `board` table with `isPublic = true` and `isActive = true`.

3. **Invite your team**  
   Invite team members so they can triage feedback, manage boards, and publish updates. Invites are stored in `workspace_invite` and, once accepted, become `workspace_member` records.

4. **Connect a roadmap and changelog**  
   For most teams we recommend enabling a roadmap board and a changelog board. These special boards use `systemType = 'roadmap'` or `systemType = 'changelog'` in the database.

5. **Share your feedback portal**  
   Share your workspace subdomain or custom domain with customers so they can start submitting posts and voting on existing ideas.

From here you can dive into each section:

- **Create Boards** explains how to model your product areas.
- **Invite Members** covers roles and permissions.
- **Plan Roadmap** shows how to use roadmap statuses.
- **Publish Updates** walks through the changelog flow.

