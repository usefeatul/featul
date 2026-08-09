import type {
  AiAction,
  AiDetailLevel,
  AiTone,
  ChangelogAiStreamEvent,
} from "@featul/api/changelog-ai/types";

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
  onStatus?: (phase: "preparing" | "generating") => void;
  onTitle?: (text: string) => void;
  onSummary?: (text: string) => void;
  onDelta?: (text: string, accumulatedBody: string) => void;
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

function handleStreamEvent(
  event: ChangelogAiStreamEvent,
  handlers: StreamHandlers,
  state: { body: string; summary: string },
) {
  if (event.type === "status") {
    handlers.onStatus?.(event.phase);
    return;
  }

  if (event.type === "title") {
    handlers.onTitle?.(event.text);
    return;
  }

  if (event.type === "summary") {
    state.summary = event.text;
    handlers.onSummary?.(event.text);
    return;
  }

  if (event.type === "delta") {
    state.body += event.text;
    handlers.onDelta?.(event.text, state.body);
    return;
  }

  if (event.type === "done") {
    handlers.onDone?.(event);
    return;
  }

  if (event.type === "error") {
    throw new Error(event.message);
  }
}

export async function streamChangelogAiAssist(
  input: ChangelogAiStreamInput,
  handlers: StreamHandlers,
) {
  const res = await fetch("/api/changelog/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message || "Failed to run AI assist");
  }

  if (!res.body) {
    throw new Error("Streaming response was empty");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const state = { body: "", summary: "" };

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
        handleStreamEvent(event, handlers, state);
      }
    }
  }

  if (buffer.trim()) {
    for (const event of parseSseEvents(buffer)) {
      handleStreamEvent(event, handlers, state);
    }
  }

  return state.body || state.summary;
}

export type { ChangelogAiStreamEvent, StreamHandlers };
