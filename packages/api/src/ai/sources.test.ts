import { describe, expect, test } from "bun:test";
import { board, changelogEntry, tag } from "@featul/db/schema";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import {
  fetchWorkspaceChangelogTags,
  type WorkspaceTagDatabase,
} from "../changelog/tags";
import { fetchAiBrandContext } from "./sources";
import { buildConversationMessages } from "./conversation";
import { resolveConversationResponse } from "./edits";

const workspaceId = "workspace-with-tags";
const visibleTags = [
  "Bugs",
  "Design",
  "Guide",
  "Security",
  "Support",
  "UI",
].map((name) => ({
  id: name.toLowerCase(),
  name,
  slug: name.toLowerCase(),
  color: null,
}));

function fixtureDatabase(hasBoard = true) {
  const dialect = new PgDialect();
  return {
    select() {
      return {
        from(table: unknown) {
          return {
            where(condition: SQL) {
              const query = dialect.sqlToQuery(condition);
              let rows: unknown[];
              if (table === tag) {
                // Query the workspace catalog, scoped to the authorized workspace.
                expect(query.sql).toContain('"workspace_id"');
                rows = query.params[0] === workspaceId ? visibleTags : [];
              } else if (table === board) {
                rows = hasBoard
                  ? [{ id: "changelog-board", changelogTags: [] }]
                  : [];
              } else if (table === changelogEntry) {
                rows = [];
              } else {
                throw new Error("Unexpected table");
              }
              return {
                limit: async () => rows,
                orderBy: () =>
                  Object.assign(Promise.resolve(rows), {
                    limit: async () => rows,
                  }),
              };
            },
          };
        },
      };
    },
  } as unknown as WorkspaceTagDatabase;
}

describe("changelog tag data source", () => {
  test("assistant sees picker tags when board.changelogTags is empty", async () => {
    const db = fixtureDatabase();
    const pickerTags = await fetchWorkspaceChangelogTags({ db, workspaceId });
    const context = await fetchAiBrandContext({ db, workspaceId });
    expect(pickerTags).toEqual(visibleTags);
    expect(context.tagNames).toEqual(pickerTags.map((item) => item.name));
    expect(context.brandVoice).toBe("");

    const messages = buildConversationMessages({
      prompt: "Add relevant tags",
      availableTagNames: context.tagNames,
    });
    const editorContext = messages.find((message) =>
      message.content.startsWith("Current editor context"),
    )!;
    const data = JSON.parse(
      editorContext.content.split("\n").slice(1).join("\n"),
    );
    expect(data.availableTags).toEqual(visibleTags.map((item) => item.name));

    const action = resolveConversationResponse(
      JSON.stringify({
        reply: "Added Guide and UI.",
        edits: [],
        draft: null,
        selection: null,
        title: null,
        summary: null,
        tags: ["Guide", "UI"],
        suggestedTags: null,
      }),
      { availableTagNames: context.tagNames },
    );
    expect(
      pickerTags
        .filter((item) => action.tagNames?.includes(item.name))
        .map((item) => item.id),
    ).toEqual(["guide", "ui"]);
    expect(action.contentMarkdown).toBeUndefined();
  });

  test("workspace tags do not depend on a changelog board or published entries", async () => {
    const context = await fetchAiBrandContext({
      db: fixtureDatabase(false),
      workspaceId,
    });
    expect(context.tagNames).toEqual(visibleTags.map((item) => item.name));
  });

  test("does not expose another workspace's tags", async () => {
    expect(
      await fetchWorkspaceChangelogTags({
        db: fixtureDatabase(),
        workspaceId: "other-workspace",
      }),
    ).toEqual([]);
  });
});
