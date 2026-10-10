import { expect, test } from "bun:test";
import { readBoundedJson } from "../../packages/api/src/request/json";

test("bounded JSON decodes UTF-8 split between chunks", async () => {
  const encoded = new TextEncoder().encode('{"value":"é"}');
  const body = new ReadableStream({ start(controller) {
    for (const byte of encoded) controller.enqueue(new Uint8Array([byte]));
    controller.close();
  } });
  expect(await readBoundedJson(new Request("http://localhost", { method: "POST", body }), encoded.length)).toEqual({ value: "é" });
});

test("bounded JSON rejects actual bytes even without a declared content length", async () => {
  const request = new Request("http://localhost", { method: "POST", body: JSON.stringify({ value: "é" }) });
  await expect(readBoundedJson(request, 5)).rejects.toMatchObject({ status: 413 });
});
