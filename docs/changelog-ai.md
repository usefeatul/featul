# Changelog writing assistant

Chat uses the current editor snapshot and the last 20 conversation messages to
choose between a reply, a clarification, and an edit. Ordinary messages no longer
fall back to replacing the whole draft. Explicit workspace-tag operations keep
the existing tag suggestion flow.

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
bun test packages/api/src/ai/edits.test.ts packages/api/src/services/openrouter.test.ts apps/app/tests/changelog.test.ts
bunx --no-install tsc --noEmit -p packages/api
bunx --no-install tsc --noEmit -p apps/app
```

Live acceptance checks: ask for two opening alternatives without editing, then
say "use the second one"; shorten one sentence; delete one paragraph; change only
the title; delete a selection; explicitly rewrite the draft; type in the editor
while a response is pending; stop a response; undo an applied edit.
