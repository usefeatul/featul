import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import React, { act, type KeyboardEvent } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import type { PanInfo } from "framer-motion";
import { usePanelResize } from "../src/hooks/usePanelResize";
import { PANEL_WIDTH_COOKIES, parsePanelWidth, type PanelKind } from "../src/lib/panel";

test("right panels resize within bounds, reset, and restore selection after dragging", async () => {
  const dom = new Window({ url: "http://localhost" });
  let measure: () => void = () => {};
  Object.assign(globalThis, {
    window: dom,
    document: dom.document,
    getComputedStyle: dom.getComputedStyle.bind(dom),
    IS_REACT_ACT_ENVIRONMENT: true,
    ResizeObserver: class {
      constructor(callback: () => void) { measure = callback; }
      observe() {}
      disconnect() {}
    },
  });
  document.documentElement.style.fontSize = "16px";
  document.body.style.cursor = "crosshair";
  document.body.style.userSelect = "text";
  let resize!: ReturnType<typeof usePanelResize>;
  function Harness({ open }: { open: boolean }) {
    resize = usePanelResize(open, "requests");
    return <div><aside ref={resize.panelRef} /></div>;
  }
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const pan = (x: number) => resize.onPan({} as PointerEvent, {
    offset: { x, y: 0 }, delta: { x, y: 0 },
    point: { x, y: 0 }, velocity: { x: 0, y: 0 },
  } satisfies PanInfo);
  const key = (value: string) => resize.onKeyDown({
    key: value, preventDefault() {},
  } as KeyboardEvent<HTMLDivElement>);

  try {
    await act(async () => root.render(<Harness open />));
    expect(resize.width.get()).toBe(22);
    await act(async () => resize.onPanStart());
    expect(document.body.style.cursor).toBe("col-resize");
    await act(async () => pan(-48));
    expect(resize.width.get()).toBe(25);
    await act(async () => pan(-1000));
    expect(resize.width.get()).toBeCloseTo(28.6);
    await act(async () => pan(1000));
    expect(resize.width.get()).toBe(22);
    await act(async () => resize.onPanEnd());
    expect(document.body.style.cursor).toBe("crosshair");
    expect(document.body.style.userSelect).toBe("text");

    await act(async () => key("ArrowLeft"));
    expect(resize.width.get()).toBe(22.5);
    await act(async () => key("ArrowRight"));
    expect(resize.width.get()).toBe(22);
    await act(async () => key("End"));
    expect(resize.width.get()).toBeCloseTo(28.6);
    await act(async () => root.render(<Harness open={false} />));
    await act(async () => root.render(<Harness open />));
    expect(resize.width.get()).toBeCloseTo(28.6);

    // A narrower editor container restricts expansion to preserve content space.
    Object.defineProperty(host.firstElementChild!, "clientWidth", { value: 720 });
    await act(async () => measure());
    expect(resize.width.get()).toBe(25);
    expect(resize.maxWidth).toBe(25);
    await act(async () => resize.onDoubleClick());
    expect(resize.width.get()).toBe(22);

    await act(async () => resize.onPanStart());
    await act(async () => pan(-32));
    await act(async () => key("Escape"));
    expect(resize.width.get()).toBe(22);
    expect(document.body.style.cursor).toBe("crosshair");

    await act(async () => resize.onPanStart());
    await act(async () => resize.onPointerCancel());
    expect(document.body.style.userSelect).toBe("text");
    await act(async () => resize.onPanStart());
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
  expect(document.body.style.cursor).toBe("crosshair");
  expect(document.body.style.userSelect).toBe("text");
});

test("each panel saves its width independently and starts at its saved server width", async () => {
  const dom = new Window({ url: "http://localhost" });
  Object.assign(globalThis, {
    window: dom,
    document: dom.document,
    getComputedStyle: dom.getComputedStyle.bind(dom),
    IS_REACT_ACT_ENVIRONMENT: true,
    ResizeObserver: class { observe() {} disconnect() {} },
  });
  let request!: ReturnType<typeof usePanelResize>;
  let assistant!: ReturnType<typeof usePanelResize>;
  function Panel({ kind, initialWidth }: { kind: PanelKind; initialWidth?: number }) {
    const resize = usePanelResize(true, kind, initialWidth);
    if (kind === "requests") request = resize;
    else assistant = resize;
    return <aside ref={resize.panelRef} data-width={resize.width.get()} />;
  }
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<><Panel kind="requests" /><Panel kind="assistant" /></>));
    await act(async () => request.onKeyDown({ key: "End", preventDefault() {} } as KeyboardEvent<HTMLDivElement>));
    await act(async () => assistant.onKeyDown({ key: "ArrowLeft", preventDefault() {} } as KeyboardEvent<HTMLDivElement>));
    expect(document.cookie).toContain(`${PANEL_WIDTH_COOKIES.requests}=28.6`);
    expect(document.cookie).toContain(`${PANEL_WIDTH_COOKIES.assistant}=22.5`);
    const serverWidth = parsePanelWidth(document.cookie.split("; ")
      .find((cookie) => cookie.startsWith(`${PANEL_WIDTH_COOKIES.requests}=`))?.split("=")[1]);
    expect(renderToString(<Panel kind="requests" initialWidth={serverWidth} />)).toContain('data-width="28.6"');

    // A newly mounted route also restores the cookie if its prefetched prop is old.
    await act(async () => root.render(<><Panel key="next-request" kind="requests" initialWidth={22} /><Panel kind="assistant" /></>));
    expect(request.width.get()).toBe(28.6);
    expect(assistant.width.get()).toBe(22.5);
    await act(async () => request.onDoubleClick());
    expect(document.cookie).toContain(`${PANEL_WIDTH_COOKIES.requests}=22`);
    expect(document.cookie).toContain(`${PANEL_WIDTH_COOKIES.assistant}=22.5`);
    expect(parsePanelWidth("invalid")).toBe(22);
    expect(parsePanelWidth("1000")).toBe(28.6);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
