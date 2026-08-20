export type AiAction =
  | "prompt"
  | "format"
  | "improve"
  | "expand"
  | "summary"
  | "generateFromPosts";

export type AiTone = "user-friendly" | "technical" | "brief";
export type AiDetailLevel = "standard" | "detailed";

export type AiSourcePost = {
  id: string;
  title: string;
  content: string;
  upvotes: number | null;
  roadmapStatus: string | null;
  updatedAt: Date | null;
  latestUpdate: {
    title: string;
    content: string;
  } | null;
};

export type ChangelogAiStreamEvent =
  | { type: "status"; phase: "preparing" | "generating" }
  | { type: "delta"; text: string }
  | { type: "title"; text: string }
  | { type: "summary"; text: string }
  | {
      type: "done";
      contentMarkdown?: string;
      summary?: string;
      title?: string;
    }
  | { type: "error"; message: string };

export type StructuredGenerationAction = Extract<
  AiAction,
  "prompt" | "generateFromPosts"
>;
