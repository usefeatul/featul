import { expect, mock, test } from "bun:test";
// Run in a separate process to keep provider mocks out of the transport tests.
const calls: AbortSignal[] = [];
mock.module("../../packages/api/src/services/openrouter", () => ({
  streamOpenRouterChat: async (
    _input: unknown,
    send: (s: string) => void,
    signal: AbortSignal,
  ) => {
    calls.push(signal);
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    send(
      calls.length === 1
        ? "Improved search performance"
        : "Search now returns results faster.",
    );
  },
}));
const { streamStructuredChangelog } =
  await import("../../packages/api/src/ai/generation");
test("title and body provider calls both receive cancellation", async () => {
  const controller = new AbortController();
  await streamStructuredChangelog({
    model: "test",
    action: "prompt",
    temperature: 0.3,
    maxBodyTokens: 100,
    signal: controller.signal,
    send() {},
  });
  expect(calls.length).toBeGreaterThanOrEqual(2);
  expect(calls.every((signal) => signal === controller.signal)).toBe(true);
});
