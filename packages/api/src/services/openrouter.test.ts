import { afterAll, afterEach, expect, spyOn, test } from "bun:test";
import {
  resolveOpenRouterStreamModel,
  streamOpenRouterChat,
} from "./openrouter";

const previousKey = process.env.OPENROUTER_API_KEY;
const previousModel = process.env.OPENROUTER_CHANGELOG_MODEL;
const fetchMock = spyOn(globalThis, "fetch");
afterAll(() => fetchMock.mockRestore());
afterEach(() => {
  fetchMock.mockReset();
  if (previousKey === undefined) delete process.env.OPENROUTER_API_KEY;
  else process.env.OPENROUTER_API_KEY = previousKey;
  if (previousModel === undefined)
    delete process.env.OPENROUTER_CHANGELOG_MODEL;
  else process.env.OPENROUTER_CHANGELOG_MODEL = previousModel;
});

function mockStream(payload: string) {
  process.env.OPENROUTER_API_KEY = "test-only";
  const bytes = new TextEncoder().encode(payload);
  fetchMock.mockResolvedValue(
    new Response(
      new ReadableStream({
        start(controller) {
          // Exercise boundaries split across network chunks, including CRLF.
          for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
          controller.close();
        },
      }),
    ),
  );
}

test("uses Sonnet for changelog writing, with a dedicated override", () => {
  delete process.env.OPENROUTER_CHANGELOG_MODEL;
  expect(resolveOpenRouterStreamModel()).toBe("anthropic/claude-sonnet-4.6");
  process.env.OPENROUTER_CHANGELOG_MODEL = " custom/model ";
  expect(resolveOpenRouterStreamModel()).toBe("custom/model");
});

test("reads fragmented SSE and Unicode through a confirmed completion", async () => {
  mockStream(
    'data: {"choices":[{"delta":{"content":"Café"}}]}\r\n\r\ndata: {"choices":[{"delta":{},"finish_reason":"stop"}]}\r\n\r\ndata: [DONE]\r\n\r\n',
  );
  let output = "";
  await streamOpenRouterChat({}, (text) => {
    output += text;
  });
  expect(output).toBe("Café");
});

test("rejects truncated streams, token limits and provider errors", async () => {
  for (const payload of [
    'data: {"choices":[{"delta":{"content":"partial"}}]}\n\n',
    'data: {"choices":[{"delta":{},"finish_reason":"length"}]}\n\n',
    'data: {"error":{"message":"provider failure"}}\n\n',
  ]) {
    mockStream(payload);
    await expect(streamOpenRouterChat({}, () => {})).rejects.toThrow();
  }
});

test("passes request cancellation to the provider", async () => {
  mockStream('data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\n');
  const controller = new AbortController();
  await streamOpenRouterChat({}, () => {}, controller.signal);
  expect(fetchMock.mock.calls[0]?.[1]?.signal).toBe(controller.signal);
});

test("collects tool arguments separately from conversational prose", async () => {
  const chunks = [
    { choices: [{ delta: { content: "I'll shorten the opening." } }] },
    {
      choices: [
        {
          delta: {
            tool_calls: [
              {
                index: 0,
                function: { name: "update_changelog", arguments: '{"edits":' },
              },
            ],
          },
        },
      ],
    },
    {
      choices: [
        {
          delta: { tool_calls: [{ index: 0, function: { arguments: "[]}" } }] },
        },
      ],
    },
    { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
  ];
  mockStream(
    chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join(""),
  );
  let prose = "";
  const calls: Array<{ name: string; arguments: string }> = [];
  await streamOpenRouterChat(
    {},
    (text) => {
      prose += text;
    },
    undefined,
    (call) => calls.push(call),
  );
  expect(prose).toBe("I'll shorten the opening.");
  expect(calls).toEqual([
    { name: "update_changelog", arguments: '{"edits":[]}' },
  ]);
});

test("does not deliver partial tool arguments after a stream failure", async () => {
  mockStream(
    'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"name":"update_changelog","arguments":"{"}}]}}]}\n\n',
  );
  let applied = false;
  await expect(
    streamOpenRouterChat(
      {},
      () => {},
      undefined,
      () => {
        applied = true;
      },
    ),
  ).rejects.toThrow();
  expect(applied).toBe(false);
});
