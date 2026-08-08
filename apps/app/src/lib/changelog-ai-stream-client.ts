import type { AiAction, AiDetailLevel, AiTone } from "@/components/changelog/changelog-ai-stream-types";

export type ChangelogAiStreamEvent =
  | { type: "delta"; text: string }
  | {
      type: "done";
      contentMarkdown?: string;
      summary?: string;
      title?: string;
    }
  | { type: "error"; message: string };

export type ChangelogAiStreamInput = {
  slug: string;
  action: AiAction;
  prompt?: string;
  title?: string;
  contentMarkdown?: string;
  sourcePostIds?: string[];
  tone?: AiTone;
  detailLevel?: AiDetailLevel;
};

type StreamHandlers = {
  onDelta?: (text: string, accumulated: string) => void;
  onDone?: (event: Extract<ChangelogAiStreamEvent, { type: "done" }>) => void;
};

function parseSseEvents(raw: string): ChangelogAiStreamEvent[] {
  const events: ChangelogAiStreamEvent[] = [];

  for (const part of raw.split("\n\n")) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const line = trimmed.split("\n").find((entry) => entry.startsWith("data: "));
    if (!line) continue;

    events.push(JSON.parse(line.slice(6)) as ChangelogAiStreamEvent);
  }

  return events;
}

export async function streamChangelogAiAssist(
  input: ChangelogAiStreamInput,
  handlers: StreamHandlers,
) {
  const res = await fetch("/api/changelog/ai-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    const message = data.message || "Failed to run AI assist";
    throw new Error(message);
  }

  if (!res.body) {
    throw new Error("Streaming response was empty");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const chunk = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");

      for (const event of parseSseEvents(chunk)) {
        if (event.type === "delta") {
          accumulated += event.text;
          handlers.onDelta?.(event.text, accumulated);
        } else if (event.type === "done") {
          handlers.onDone?.(event);
        } else if (event.type === "error") {
          throw new Error(event.message);
        }
      }
    }
  }

  if (buffer.trim()) {
    for (const event of parseSseEvents(buffer)) {
      if (event.type === "delta") {
        accumulated += event.text;
        handlers.onDelta?.(event.text, accumulated);
      } else if (event.type === "done") {
        handlers.onDone?.(event);
      } else if (event.type === "error") {
        throw new Error(event.message);
      }
    }
  }

  return accumulated;
}
