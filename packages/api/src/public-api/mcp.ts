import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { STATUSES } from "../shared/status";
import {
  getChangelogEntry,
  listChangelogEntries,
  listEntriesSchema,
  updateChangelogEntry,
  updateEntrySchema,
  upsertChangelogEntry,
  upsertEntrySchema,
} from "./changelog";
import {
  createCommentSchema,
  createFeedbackComment,
  getFeedback,
  getFeedbackOverview,
  listFeedback,
  listFeedbackSchema,
  mergeFeedback,
  mergeFeedbackSchema,
  updateFeedback,
  updateFeedbackSchema,
} from "./feedback";
import { ApiError, requireScope, type ApiKeyContext, type ApiKeyScope } from "./keys";

const SERVER_INSTRUCTIONS = `Featul is a feedback board, roadmap and changelog for one workspace.
Feedback posts have a roadmap status (pending → review → planned → progress → completed, or closed) and tags.
Start with get_workspace_overview to learn the boards, statuses, feedback tags and changelog tags; tags must already exist.
Triage: list_feedback with status=pending (or untagged=true), read posts with get_feedback, then update_feedback, merge_feedback for duplicates, and add_feedback_comment for internal notes.
Changelog: list_feedback with completedAfter (and notInChangelog) to find what shipped, then create_changelog_draft.
Changelog entries are always saved as drafts; a person reviews and publishes them in Featul.`;

const statusSchema = z.enum(STATUSES);
const tagsSchema = z.array(z.string()).max(20);

type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };
type ToolConfig = {
  title: string;
  description: string;
  inputSchema?: Record<string, z.ZodTypeAny>;
  annotations: Record<string, boolean>;
};
type PromptResult = { messages: { role: "user"; content: { type: "text"; text: string } }[] };
type PromptConfig = { title: string; description: string; argsSchema: Record<string, z.ZodTypeAny> };

/**
 * Non-generic views of `registerTool`/`registerPrompt`: inferring the SDK's generics over these
 * zod shapes costs the type checker over a gigabyte, and inputs are re-parsed by our schemas anyway.
 */
function registrars(server: McpServer) {
  return {
    tool: server.registerTool.bind(server) as unknown as (
      name: string,
      config: ToolConfig,
      cb: (args: any) => Promise<ToolResult>,
    ) => void,
    prompt: server.registerPrompt.bind(server) as unknown as (
      name: string,
      config: PromptConfig,
      cb: (args: Record<string, string | undefined>) => PromptResult,
    ) => void,
  };
}

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

/** Runs a tool with a scope check, turning API errors into tool errors the model can read and fix. */
function run<A>(key: ApiKeyContext, scope: ApiKeyScope, fn: (args: A) => Promise<unknown>) {
  return async (args: A): Promise<ToolResult> => {
    try {
      requireScope(key, scope);
      return text(await fn(args));
    } catch (error) {
      if (error instanceof ApiError) {
        return { ...text({ error: { code: error.code, message: error.message } }), isError: true };
      }
      if (error instanceof z.ZodError) {
        const message = error.issues
          .map((issue) => (issue.path.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message))
          .join("; ");
        return { ...text({ error: { code: "invalid_request", message } }), isError: true };
      }
      // Never hand internal error details (SQL, stack traces) to the client.
      console.error("[mcp] tool failed", error);
      return { ...text({ error: { code: "internal_error", message: "Something went wrong" } }), isError: true };
    }
  };
}

/** The MCP server for one API key's workspace: feedback triage and changelog drafting tools. */
export function createFeatulMcpServer(db: any, key: ApiKeyContext) {
  const server = new McpServer(
    { name: "featul", title: "Featul", version: "1.0.0" },
    { instructions: SERVER_INSTRUCTIONS },
  );
  const { tool, prompt } = registrars(server);
  const readOnly = { readOnlyHint: true, openWorldHint: false };
  const write = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };

  tool(
    "get_workspace_overview",
    {
      title: "Workspace overview",
      description:
        "Feedback boards, roadmap statuses with post counts, feedback tags for triage, and changelog tags for drafts.",
      annotations: readOnly,
    },
    run(key, "feedback:read", () => getFeedbackOverview(db, key)),
  );

  tool(
    "list_feedback",
    {
      title: "List feedback",
      description:
        "Lists feedback posts with an excerpt, status, tags, votes and comment count. Use get_feedback for the full post and comments.",
      inputSchema: {
        board: z.array(z.string()).optional().describe("Board slugs"),
        status: z.array(statusSchema).optional().describe("Roadmap statuses; posts with no status count as pending"),
        tag: tagsSchema.optional().describe("Tag names; posts with any of them match"),
        untagged: z.boolean().optional().describe("Only posts without tags"),
        search: z.string().optional().describe("Text to match in the title or description"),
        state: z
          .enum(["published", "pending_approval", "archived", "spam"])
          .optional()
          .describe("Moderation state, default published. pending_approval is the moderation queue"),
        createdAfter: z.string().optional().describe("ISO date"),
        updatedAfter: z.string().optional().describe("ISO date; any change counts, including votes and comments"),
        completedAfter: z.string().optional().describe("ISO date; posts moved to completed since then, e.g. since the last release"),
        notInChangelog: z.boolean().optional().describe("Leave out posts already linked from a changelog entry"),
        includeSnoozed: z.boolean().optional().describe("Include snoozed posts, hidden by default"),
        sort: z.enum(["newest", "oldest", "votes", "comments", "updated"]).optional(),
        limit: z.number().int().min(1).max(100).optional().describe("Default 25"),
        offset: z.number().int().min(0).optional(),
      },
      annotations: readOnly,
    },
    run(key, "feedback:read", (args) => listFeedback(db, key, listFeedbackSchema.parse(args))),
  );

  tool(
    "get_feedback",
    {
      title: "Get feedback",
      description: "One feedback post with its full description and comments, internal notes included.",
      inputSchema: { id: z.string().describe("Feedback post id") },
      annotations: readOnly,
    },
    run(key, "feedback:read", ({ id }: { id: string }) => getFeedback(db, key, id)),
  );

  tool(
    "update_feedback",
    {
      title: "Update feedback",
      description:
        "Triages a post: set its roadmap status, change tags, move it to another board, or fix its title. Voters are notified of status changes like in the dashboard.",
      inputSchema: {
        id: z.string().describe("Feedback post id"),
        status: statusSchema.optional(),
        addTags: tagsSchema.optional().describe("Tag names to add"),
        removeTags: tagsSchema.optional().describe("Tag names to remove"),
        tags: tagsSchema.optional().describe("Replaces every tag; don't combine with addTags/removeTags"),
        board: z.string().optional().describe("Board slug to move the post to"),
        title: z.string().optional().describe("A clearer title"),
      },
      annotations: write,
    },
    run(key, "feedback:write", ({ id, ...rest }: { id: string } & Record<string, unknown>) =>
      updateFeedback(db, key, id, updateFeedbackSchema.parse(rest)),
    ),
  );

  tool(
    "merge_feedback",
    {
      title: "Merge duplicate feedback",
      description:
        "Merges a duplicate post into a published post: votes, comments and tags move to the target and the duplicate is archived. This can't be undone through the API.",
      inputSchema: {
        duplicateId: z.string().describe("The duplicate post, which is archived"),
        targetId: z.string().describe("The post that keeps everything"),
        reason: z.string().optional(),
      },
      annotations: { ...write, destructiveHint: true },
    },
    run(key, "feedback:write", ({ duplicateId, ...rest }: { duplicateId: string } & Record<string, unknown>) =>
      mergeFeedback(db, key, duplicateId, mergeFeedbackSchema.parse(rest)),
    ),
  );

  tool(
    "add_feedback_comment",
    {
      title: "Comment on feedback",
      description:
        "Adds an internal note (visible to the team only) to a post. Set internal=false only when the person explicitly asked to reply publicly.",
      inputSchema: {
        id: z.string().describe("Feedback post id"),
        content: z.string().describe("Plain text"),
        internal: z.boolean().optional().describe("Default true"),
      },
      annotations: write,
    },
    run(key, "feedback:write", ({ id, ...rest }: { id: string } & Record<string, unknown>) =>
      createFeedbackComment(db, key, id, createCommentSchema.parse(rest)),
    ),
  );

  tool(
    "list_changelog_entries",
    {
      title: "List changelog entries",
      description: "Recent changelog entries, to match the tone and format of past updates or find existing drafts.",
      inputSchema: {
        status: z.enum(["draft", "published"]).optional(),
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
      },
      annotations: readOnly,
    },
    run(key, "changelog:read", (args) => listChangelogEntries(db, key, listEntriesSchema.parse(args))),
  );

  tool(
    "get_changelog_entry",
    {
      title: "Get changelog entry",
      description: "One changelog entry by id.",
      inputSchema: { id: z.string() },
      annotations: readOnly,
    },
    run(key, "changelog:read", ({ id }: { id: string }) => getChangelogEntry(db, key, id)),
  );

  const changelogTagsHelp = "Changelog tag names from get_workspace_overview's changelogTags (not feedback tags)";

  tool(
    "create_changelog_draft",
    {
      title: "Draft a changelog entry",
      description:
        "Saves a changelog entry as a draft for the team to review and publish in Featul. Link the shipped feedback posts so voters can find the update.",
      inputSchema: {
        title: z.string(),
        content: z.string().describe("Markdown body"),
        summary: z.string().optional().describe("One-line summary; derived from the body when omitted"),
        tags: tagsSchema.optional().describe(changelogTagsHelp),
        relatedFeedbackIds: z.array(z.string()).max(20).optional().describe("Feedback post ids this update ships"),
      },
      annotations: write,
    },
    run(key, "changelog:write", async (args) => {
      const input = upsertEntrySchema.parse({ ...(args as object), status: "draft" });
      return (await upsertChangelogEntry(db, key, input)).entry;
    }),
  );

  tool(
    "update_changelog_draft",
    {
      title: "Edit a changelog draft",
      description: "Edits a draft changelog entry. Published entries can only be changed in Featul.",
      inputSchema: {
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional().describe("Markdown body; replaces the current body"),
        summary: z.string().optional(),
        tags: tagsSchema.optional().describe(changelogTagsHelp),
        relatedFeedbackIds: z.array(z.string()).max(20).optional(),
      },
      annotations: { ...write, idempotentHint: true },
    },
    run(key, "changelog:write", async ({ id, ...rest }: { id: string } & Record<string, unknown>) => {
      const existing = await getChangelogEntry(db, key, id);
      if (existing.status !== "draft") {
        throw new ApiError(400, "not_a_draft", "This entry is published; edit it in Featul instead");
      }
      return updateChangelogEntry(db, key, id, updateEntrySchema.parse(rest));
    }),
  );

  prompt(
    "triage_feedback",
    {
      title: "Triage new feedback",
      description: "Tag, prioritize and dedupe the feedback that hasn't been triaged yet.",
      argsSchema: { board: z.string().optional().describe("Board slug, or all boards") },
    },
    ({ board }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Triage the untriaged feedback in Featul${board ? ` on the "${board}" board` : ""}.
1. Call get_workspace_overview to learn the boards, statuses and tags.
2. Call list_feedback with status ["pending"]${board ? ` and board ["${board}"]` : ""}, then read each post with get_feedback.
3. For each post: add fitting existing tags, move it to "review" when it's actionable, and spot duplicates of other posts (search with list_feedback).
4. Before changing anything, show me a table: post, proposed tags, proposed status, duplicate of. Wait for my go-ahead.
5. Then apply it with update_feedback and merge_feedback, and leave a short internal note with add_feedback_comment where your reasoning helps the team.`,
          },
        },
      ],
    }),
  );

  prompt(
    "draft_changelog",
    {
      title: "Draft a changelog entry",
      description: "Write a changelog draft from the feedback completed since a date.",
      argsSchema: { since: z.string().optional().describe("ISO date; defaults to the last published entry") },
    },
    ({ since }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Draft a Featul changelog entry for what we shipped${since ? ` since ${since}` : " since the last published update"}.
1. Call list_changelog_entries (status "published", limit 3) to match the tone and format${since ? "" : ", and use the newest entry's publishedAt as the start date"}.
2. Call list_feedback with completedAfter set to that date, notInChangelog true and sort "votes", and read the important posts with get_feedback.
3. Write a short, user-facing entry in Markdown: a clear title, a one-paragraph intro, then grouped bullet points. Credit the feedback, don't mention internal notes.
4. Save it with create_changelog_draft, passing the shipped posts as relatedFeedbackIds and fitting changelogTags from get_workspace_overview, and give me the draft's title and a summary of what it covers.`,
          },
        },
      ],
    }),
  );

  return server;
}

/** Handles one stateless Streamable HTTP request: every request gets its own server and transport. */
export async function handleMcpRequest(req: Request, db: any, key: ApiKeyContext): Promise<Response> {
  const server = createFeatulMcpServer(db, key);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  try {
    return await transport.handleRequest(req);
  } finally {
    // Responses are buffered JSON, so the request is finished by the time handleRequest resolves.
    void server.close();
  }
}
