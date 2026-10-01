# Changelog writing assistant

Chat uses the current editor snapshot and the last 20 conversation messages to
choose between a reply, a clarification, and an edit. Ordinary messages no longer
fall back to replacing the whole draft. Tag suggestions and application also use the conversation tool, with current and
pending tag names supplied as context. Existing unambiguous tag shortcuts still
apply immediately.

Chat replies use plain, conversational language and match the author's language
and formality. Small edits get a short, specific response; writing feedback gets
concrete suggestions. Avoid stock praise, repeated introductions, and routine
follow-up questions. Chat tone is separate from the draft's voice. The UI preserves
the model's reply when present and uses brief fallbacks for local tag actions.
Replies avoid em dashes, using ordinary sentence punctuation instead. Literal
quotes, code, tag names, and exact edit anchors retain their original text.

## Model configuration

The default is `anthropic/claude-sonnet-4.6` through the existing
`OPENROUTER_API_KEY`. Set `OPENROUTER_CHANGELOG_MODEL` to override it with a model
and provider that support OpenRouter tool calling. Restart the
app after changing environment variables.

Changelog writing no longer reads `OPENROUTER_STREAM_MODEL` or the general
`OPENROUTER_MODEL`; these legacy settings cannot silently keep it on Gemini Flash.
Other automation keeps its existing model configuration. Sonnet has a higher
per-token cost than the previous Flash default.

## Applying edits

- The model answers naturally in chat and uses an `update_changelog` tool for
  exact `before` / `after` edits. All anchors are
  resolved against the same snapshot; missing, ambiguous, overlapping, malformed,
  or truncated edits are rejected without changing the document.
- An empty replacement deletes text. New drafts use a separate field that is
  rejected when a draft already exists. A requested full rewrite uses edits.
- The editor checks that its content, title and summary still match the request.
  Each body edit becomes a local editor transaction, preserving unrelated rich
  text attributes. If markdown positions cannot be mapped safely, it rejects the
  edit. Selected excerpts are replaced only in their captured range.
- Both the picker and AI context read the workspace `tag` table through
  `fetchWorkspaceChangelogTags`; they do not use the legacy `board.changelogTags`
  field as the editor catalog.
- Tag actions resolve exact existing workspace names on the server and tag IDs in
  the editor. Suggestions do not mutate the selection. Applied tag changes retain
  undo and mark the entry dirty for the normal save flow.
- Title and summary changes are explicit. An opening summary belongs in the body;
  the separate summary field changes only when requested.
- Tool calls apply after validation, never while partial arguments are streaming. Undo
  restores the original rich document, title, summary and tags.

The model still chooses edit scope from natural language. Exact-match validation
protects everything outside those ranges, but does not prove the model interpreted
the request correctly. Keep the undo control and check representative writing
requests when changing models or prompts.

## Verification

```sh
bun test packages/api/src/ai/edits.test.ts packages/api/src/ai/sources.test.ts packages/api/src/services/openrouter.test.ts apps/app/tests/changelog.test.ts
bunx --no-install tsc --noEmit -p packages/api
bunx --no-install tsc --noEmit -p apps/app
```

Live acceptance checks: ask for two opening alternatives without editing, then
say "use the second one"; shorten one sentence; delete one paragraph; change only
the title; delete a selection; explicitly rewrite the draft; type in the editor
while a response is pending; stop a response; undo an applied edit.
