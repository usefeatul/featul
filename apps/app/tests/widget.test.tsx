import { afterEach, expect, mock, test } from "bun:test";
import { Window } from "happy-dom";
import React, { act } from "react";
import { useWidgetPosts } from "../src/hooks/useWidgetPosts";
import type { WidgetPost } from "../src/components/widget/types";

const dom = new Window();
Object.assign(globalThis, {
  window: dom,
  document: dom.document,
  navigator: dom.navigator,
  HTMLElement: dom.HTMLElement,
  IS_REACT_ACT_ENVIRONMENT: true,
});
const { createRoot } = await import("react-dom/client");
const post = (id: string) => ({ id }) as WidgetPost;
type Page = { posts: WidgetPost[]; nextOffset: number | null };
let fetchPage = mock(
  async (_offset: number, _signal: AbortSignal): Promise<Page> => ({
    posts: [post("a")],
    nextOffset: 20,
  }),
);
let state: ReturnType<typeof useWidgetPosts>;
let root: ReturnType<typeof createRoot>;
let viewerKey = "viewer";
function Harness() {
  state = useWidgetPosts({ fetchPage, refreshKey: 0, viewerKey });
  return null;
}
async function mount() {
  viewerKey = "viewer";
  fetchPage = mock(
    async (_offset: number, _signal: AbortSignal): Promise<Page> => ({
      posts: [post("a")],
      nextOffset: 20,
    }),
  );
  const host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => root.render(<Harness />));
}
afterEach(async () => {
  await act(async () => root?.unmount());
  document.body.innerHTML = "";
});

test("deduplicates pages, blocks overlapping pagination, and stops non-advancing offsets", async () => {
  await mount();
  let resolve!: (page: Page) => void;
  fetchPage.mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  let pending: Promise<void> | undefined;
  await act(async () => {
    pending = state.loadMore();
    void state.loadMore();
  });
  expect(fetchPage).toHaveBeenCalledTimes(2);
  await act(async () => {
    resolve({ posts: [post("a"), post("b"), post("b")], nextOffset: 20 });
    await pending;
  });
  expect(state.posts.map((row) => row.id)).toEqual(["a", "b"]);
  expect(state.nextOffset).toBeNull();
});

test("a newer search cancels an old request and ignores its late response", async () => {
  await mount();
  let resolve!: (page: Page) => void;
  let oldSignal!: AbortSignal;
  fetchPage = mock((_offset, signal) => {
    oldSignal = signal;
    return new Promise((done) => {
      resolve = done;
    });
  });
  await act(async () => root.render(<Harness />));
  fetchPage = mock(async () => ({ posts: [post("new")], nextOffset: null }));
  await act(async () => root.render(<Harness />));
  expect(oldSignal.aborted).toBe(true);
  await act(async () => resolve({ posts: [post("stale")], nextOffset: 20 }));
  expect(state.posts.map((row) => row.id)).toEqual(["new"]);
  expect(state.loading).toBe(false);
});

test("pagination failure keeps feedback visible and retry uses the failed offset", async () => {
  await mount();
  fetchPage.mockImplementation(async () => {
    throw new Error("offline");
  });
  await act(async () => {
    await state.loadMore();
  });
  expect(state.posts.map((row) => row.id)).toEqual(["a"]);
  expect(state.error).toBeTruthy();
  await act(async () => {
    await state.loadMore();
  });
  expect(fetchPage).toHaveBeenCalledTimes(2);
  fetchPage.mockImplementation(async () => ({
    posts: [post("b")],
    nextOffset: null,
  }));
  await act(async () => {
    await state.retry();
  });
  expect(fetchPage.mock.calls.at(-1)?.[0]).toBe(20);
  expect(state.posts.map((row) => row.id)).toEqual(["a", "b"]);
  expect(state.error).toBe("");
});

test("changing viewers clears previous data while new data is requested", async () => {
  await mount();
  let resolve!: (page: Page) => void;
  fetchPage = mock(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  viewerKey = "other";
  await act(async () => root.render(<Harness />));
  expect(state.posts).toEqual([]);
  expect(state.hasLoaded).toBe(false);
  await act(async () => resolve({ posts: [post("other")], nextOffset: null }));
  expect(state.posts.map((row) => row.id)).toEqual(["other"]);
});
