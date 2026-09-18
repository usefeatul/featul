import { afterEach, expect, mock, test } from "bun:test";
import { Window } from "happy-dom";
import React, { act } from "react";
import type { RequestItemData } from "../src/types/request";

const dom = new Window();
Object.assign(globalThis, { window: dom, document: dom.document, navigator: dom.navigator, HTMLElement: dom.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true });
let query = "";
let observerOptions: IntersectionObserverInit | undefined;
let intersect: (() => void) | undefined;
class Observer {
  constructor(callback: (entries: { isIntersecting: boolean }[]) => void, options: IntersectionObserverInit) {
    observerOptions = options;
    intersect = () => callback([{ isIntersecting: true }]);
  }
  observe() {}
  disconnect() { intersect = undefined; }
}
Object.assign(globalThis, { IntersectionObserver: Observer });
const load = mock(async (): Promise<{ items: RequestItemData[]; nextOffset: number; hasMore: boolean }> => ({ items: [], nextOffset: 20, hasMore: false }));
mock.module("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(query) }));
mock.module("@/lib/requests.actions", () => ({ loadMoreRequests: load }));
const { useInfiniteRequests } = await import("../src/hooks/useInfiniteRequests");
const { createRoot } = await import("react-dom/client");
const item = (id: string) => ({ id } as RequestItemData);
let state: ReturnType<typeof useInfiniteRequests>;
let initial = [item("a")];
let root: ReturnType<typeof createRoot>;
function Harness() {
  state = useInfiniteRequests({ items: initial, workspaceSlug: "demo", initialOffset: 20, initialTotalCount: 40, variant: "requests" });
  return <div data-workspace-scroll><div ref={state.sentinelRef} /></div>;
}
async function mount() {
  query = "";
  initial = [item("a")];
  load.mockClear();
  const host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => root.render(<Harness />));
}
afterEach(async () => {
  await act(async () => root?.unmount());
  document.body.innerHTML = "";
});

test("observes the content scroller and appends without duplicate IDs", async () => {
  await mount();
  expect(observerOptions?.root).toBe(document.querySelector("[data-workspace-scroll]"));
  load.mockImplementation(async () => ({ items: [item("a"), item("b"), item("b")], nextOffset: 23, hasMore: false }));
  await act(async () => { await state.loadMore(); });
  expect(state.listItems.map((row) => row.id)).toEqual(["a", "b"]);
  expect(state.hasMore).toBe(false);
  await act(async () => { await state.loadMore(); });
  expect(load).toHaveBeenCalledTimes(1);
});

test("prevents overlapping loads and ignores a response after filters change", async () => {
  await mount();
  let resolve!: (value: Awaited<ReturnType<typeof load>>) => void;
  load.mockImplementation(() => new Promise((done) => { resolve = done; }));
  let pending!: Promise<void>;
  await act(async () => { pending = state.loadMore(); void state.loadMore(); });
  expect(load).toHaveBeenCalledTimes(1);
  query = "search=new";
  initial = [item("new")];
  await act(async () => root.render(<Harness />));
  await act(async () => {
    resolve({ items: [item("old")], nextOffset: 21, hasMore: false });
    await pending;
  });
  expect(state.listItems.map((row) => row.id)).toEqual(["new"]);
  expect(state.hasMore).toBe(true);
  expect(state.isLoading).toBe(false);
});

test("keeps existing rows after failure and retries the same offset", async () => {
  await mount();
  load.mockImplementation(async () => { throw new Error("offline"); });
  await act(async () => { await state.loadMore(); });
  expect(state.error).toBe(true);
  expect(state.listItems.map((row) => row.id)).toEqual(["a"]);
  load.mockImplementation(async () => ({ items: [item("b")], nextOffset: 21, hasMore: false }));
  await act(async () => { await state.loadMore(); });
  expect(state.error).toBe(false);
  expect(load).toHaveBeenLastCalledWith({ slug: "demo", offset: 20, query: "", variant: "requests" });
  expect(state.listItems.map((row) => row.id)).toEqual(["a", "b"]);
});


test("prefetches ahead of the viewport and keeps filling while the sentinel is visible", async () => {
  await mount();
  expect(observerOptions?.rootMargin).toBe("0px 0px 480px 0px");
  load.mockImplementationOnce(async () => ({ items: [item("b")], nextOffset: 21, hasMore: true }));
  load.mockImplementationOnce(async () => ({ items: [item("c")], nextOffset: 22, hasMore: false }));
  await act(async () => { intersect?.(); });
  expect(state.listItems.map((row) => row.id)).toEqual(["a", "b"]);
  expect(intersect).toBeDefined();
  await act(async () => { intersect?.(); });
  expect(state.listItems.map((row) => row.id)).toEqual(["a", "b", "c"]);
  expect(intersect).toBeUndefined();
});

test("stops automatic loading if a batch fails to advance the offset", async () => {
  await mount();
  load.mockImplementation(async () => ({ items: [item("a")], nextOffset: 20, hasMore: true }));
  await act(async () => { intersect?.(); });
  expect(state.hasMore).toBe(false);
  expect(intersect).toBeUndefined();
  await act(async () => { await state.loadMore(); });
  expect(load).toHaveBeenCalledTimes(1);
});
