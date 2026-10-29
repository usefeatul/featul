---
title: MCP Server
description: Let Claude, Cursor, or any MCP client triage your feedback and draft changelog entries.
---

## Overview

Featul's MCP server connects AI assistants like Claude Code, Claude Desktop, and Cursor to your workspace. Ask in plain language and the assistant reads your feedback and does the work:

- "Triage this week's new feedback": it tags posts, sets roadmap statuses, merges duplicates, and leaves internal notes.
- "Draft a changelog for what we shipped since the last release": it finds completed posts, writes the update, and saves it as a draft linked to that feedback.

Changelog entries are always saved as **drafts**. Nothing is published until someone on your team reviews it in Featul.

The MCP server is available on Starter and Professional.

## Create an API key

Workspace owners and admins can create a key in **Settings → Developers**. The key acts as the person who created it, so changes made by the assistant show up in the activity log under their name.

Keys created before the MCP server launched only have changelog access. Create a new key to triage feedback.

## Connect your assistant

The server address is `https://api.featul.com/mcp`. It uses Streamable HTTP and the key goes in the `Authorization` header.

### Claude Code

```bash
claude mcp add --transport http featul https://api.featul.com/mcp \
  --header "Authorization: Bearer $FEATUL_API_KEY"
```

### Cursor

Add this to `.cursor/mcp.json` in your project, or to `~/.cursor/mcp.json` for every project:

```json
{
  "mcpServers": {
    "featul": {
      "url": "https://api.featul.com/mcp",
      "headers": { "Authorization": "Bearer ftl_your_key" }
    }
  }
}
```

### Claude Desktop and other clients

Clients that only connect to local servers can use `mcp-remote`:

```json
{
  "mcpServers": {
    "featul": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://api.featul.com/mcp", "--header", "Authorization: Bearer ftl_your_key"]
    }
  }
}
```

If you self-host Featul, use your app's address with `/api/mcp`, for example `https://featul.yourcompany.com/api/mcp`.

## Prompts

The server comes with two ready-made prompts. In Claude Code they show up as slash commands, like `/mcp__featul__triage_feedback`.

| Prompt | What it does |
| --- | --- |
| `triage_feedback` | Reviews pending posts (optionally on one board), proposes tags, statuses, and duplicates in a table, and applies them after you approve. |
| `draft_changelog` | Finds the feedback completed since a date (or your last published update) that isn't in a changelog entry yet, writes an entry in the style of your past updates, and saves it as a draft. |

## Tools

| Tool | What it does |
| --- | --- |
| `get_workspace_overview` | Your feedback boards, roadmap statuses with post counts, and tags. |
| `list_feedback` | Posts filtered by board, status, tag, untagged, search text, creation date, or completion date, optionally leaving out posts already in a changelog entry. Sorted by newest, votes, comments, or last update. Snoozed posts are hidden unless asked for. |
| `get_feedback` | One post with its full description and comments, internal notes included. |
| `update_feedback` | Sets the roadmap status, adds or removes tags, moves the post to another board, or fixes its title. Voters are notified of status changes. |
| `merge_feedback` | Merges a duplicate into another published post. Votes, comments, and tags move over and the duplicate is archived. |
| `add_feedback_comment` | Adds an internal note, or a public reply when you ask for one. |
| `list_changelog_entries` | Recent changelog entries, so drafts match the tone of past updates. |
| `get_changelog_entry` | One changelog entry. |
| `create_changelog_draft` | Saves a Markdown changelog entry as a draft, linked to the feedback it ships. |
| `update_changelog_draft` | Edits a draft. Published entries can only be changed in Featul. |

Tags must already exist. Create feedback tags and changelog tags in your workspace settings.

## Security

- A key only reaches its own workspace.
- It stops working if it's revoked, or if its creator leaves the workspace or stops being an owner or admin.
- Requests share the REST API's rate limit of 60 a minute per key.
- The MCP tools can't publish changelog entries or delete feedback. The same key can still publish through the [REST API](/docs/developers/api), so give it only to tools you trust.

## Next steps

- [REST API reference](/docs/developers/api)
- [Organize feedback](/docs/getting-started/organize-feedback)
