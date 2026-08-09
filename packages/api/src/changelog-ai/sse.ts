import type { ChangelogAiStreamEvent } from "./types";

export function encodeChangelogAiSseEvent(event: ChangelogAiStreamEvent) {
  return `: ${Date.now()}\ndata: ${JSON.stringify(event)}\n\n`;
}

export function createSseStreamHeaders() {
  return new Headers({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
}
