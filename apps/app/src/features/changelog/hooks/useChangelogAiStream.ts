import type { RefObject } from "react";
import type { FeedEditorRef } from "@/components/editor/editor";
import {
  streamChangelogAiAssist,
  type ChangelogAiStreamInput,
} from "../client";

type UseChangelogAiStreamOptions = {
  editorRef: RefObject<FeedEditorRef | null>;
  usesStructuredSections: boolean;
  onTitle?: (title: string) => void;
  onComplete?: (result: {
    title?: string;
    contentMarkdown?: string;
  }) => void;
};

export async function runChangelogAiStream(
  input: ChangelogAiStreamInput,
  options: UseChangelogAiStreamOptions,
) {
  let pendingBody: string | null = null;
  let bodyFrame: number | null = null;
  let bodyStreamStarted = false;

  const flushBodyPreview = () => {
    bodyFrame = null;
    if (pendingBody === null) return;
    const markdown = pendingBody;
    pendingBody = null;

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
    await streamChangelogAiAssist(input, {
      onTitle: (text) => {
        if (text.trim()) {
          options.onTitle?.(text.slice(0, 256));
        }
      },
      onDelta: (_text, accumulated) => {
        scheduleBodyPreview(accumulated);
      },
      onDone: (event) => {
        if (bodyFrame !== null) {
          window.cancelAnimationFrame(bodyFrame);
          bodyFrame = null;
        }
        pendingBody = null;
        options.onComplete?.({
          title: event.title,
          contentMarkdown: event.contentMarkdown,
        });
      },
    });
  } finally {
    if (bodyFrame !== null) {
      window.cancelAnimationFrame(bodyFrame);
    }
  }
}
