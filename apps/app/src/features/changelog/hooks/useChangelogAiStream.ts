import type { RefObject } from "react";
import type { FeedEditorRef } from "@/components/editor/editor";
import {
  streamChangelogAiAssist,
  type ChangelogAiStreamInput,
} from "../client";

type UseChangelogAiStreamOptions = {
  editorRef: RefObject<FeedEditorRef | null>;
  usesStructuredSections: boolean;
  applyToEditor: boolean;
  patchSelection: boolean;
  signal?: AbortSignal;
  onStatus?: (phase: "preparing" | "generating") => void;
  onStreamStart?: () => void;
  onTitle?: (title: string) => void;
  onReplyDelta?: (accumulated: string) => void;
  onComplete?: (result: {
    title?: string;
    contentMarkdown?: string;
    reply?: string;
    suggestedTags?: string[];
    summary?: string;
  }) => void;
};

export async function runChangelogAiStream(
  input: ChangelogAiStreamInput,
  options: UseChangelogAiStreamOptions,
) {
  let pendingBody: string | null = null;
  let bodyFrame: number | null = null;
  let pendingReply: string | null = null;
  let replyFrame: number | null = null;
  let bodyStreamStarted = false;
  let streamStarted = false;

  const flushReplyPreview = () => {
    replyFrame = null;
    if (pendingReply === null) return;
    const reply = pendingReply;
    pendingReply = null;
    options.onReplyDelta?.(reply);
  };

  const scheduleReplyPreview = (reply: string) => {
    pendingReply = reply;
    if (replyFrame !== null) return;
    replyFrame = window.requestAnimationFrame(flushReplyPreview);
  };

  const flushBodyPreview = () => {
    bodyFrame = null;
    if (pendingBody === null) return;
    const markdown = pendingBody;
    pendingBody = null;

    if (!options.applyToEditor || options.patchSelection) return;

    if (!bodyStreamStarted) {
      bodyStreamStarted = true;
      options.editorRef.current?.beginAiStream();
    }

    if (options.usesStructuredSections) {
      options.editorRef.current?.updateStreamingMarkdown(markdown);
      return;
    }

    options.editorRef.current?.setStreamingMarkdown(markdown);
  };

  const scheduleBodyPreview = (markdown: string) => {
    pendingBody = markdown;
    if (bodyFrame !== null) return;
    bodyFrame = window.requestAnimationFrame(flushBodyPreview);
  };

  try {
    await streamChangelogAiAssist(
      input,
      {
        onStatus: options.onStatus,
        onTitle: (text) => {
          if (text.trim()) {
            options.onTitle?.(text.slice(0, 256));
          }
        },
        onDelta: (_text, accumulated) => {
          if (!streamStarted) {
            streamStarted = true;
            options.onStreamStart?.();
          }
          if (!options.applyToEditor) {
            scheduleReplyPreview(accumulated);
            return;
          }
          scheduleBodyPreview(accumulated);
        },
        onDone: (event) => {
          if (bodyFrame !== null) {
            window.cancelAnimationFrame(bodyFrame);
            bodyFrame = null;
          }
          if (replyFrame !== null) {
            window.cancelAnimationFrame(replyFrame);
            replyFrame = null;
          }
          pendingBody = null;
          pendingReply = null;
          options.onComplete?.({
            title: event.title,
            contentMarkdown: event.contentMarkdown,
            reply: event.reply,
            suggestedTags: event.suggestedTags,
            summary: event.summary,
          });
        },
      },
      options.signal,
    );
  } finally {
    if (bodyFrame !== null) {
      window.cancelAnimationFrame(bodyFrame);
    }
    if (replyFrame !== null) {
      window.cancelAnimationFrame(replyFrame);
    }
  }
}
