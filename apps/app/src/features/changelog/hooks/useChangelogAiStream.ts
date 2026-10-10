import {
  streamChangelogAiAssist,
  type ChangelogAiStreamInput,
  type ChangelogAiStreamEvent,
} from "../client";

type ConversationResult = Extract<ChangelogAiStreamEvent, { type: "done" }>;

type ChangelogAiStreamOptions = {
  signal?: AbortSignal;
  onStatus?: (phase: "preparing" | "generating") => void;
  onReplyDelta?: (reply: string) => void;
  onComplete: (result: ConversationResult) => void;
};

// Chat prose may stream, but document changes only arrive after tool validation.
export async function runChangelogAiStream(
  input: ChangelogAiStreamInput,
  options: ChangelogAiStreamOptions,
) {
  await streamChangelogAiAssist(
    input,
    {
      onStatus: options.onStatus,
      onDelta: (_text, accumulated) => options.onReplyDelta?.(accumulated),
      onDone: options.onComplete,
    },
    options.signal,
  );
}
