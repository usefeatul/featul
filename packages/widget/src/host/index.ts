import type {
  FeatulWidgetApi,
  FeatulWidgetOptions,
  FeatulWidgetSection,
  FeatulWidgetUser,
} from "../index";
import {
  FRAME_SOURCE,
  HOST_SOURCE,
  createWidgetEnvelope,
  isExpectedWidgetMessageSource,
  readWidgetMessage,
  type WidgetHostEvent,
} from "../protocol";

const PANEL_RADIUS = "12px";
const BUTTON_RADIUS = "8px";
const LAUNCHER_SIZE = 36;
const PANEL_WIDTH = 396;
const PANEL_WIDTH_EXPANDED = 500;
const PANEL_HEIGHT = 1600;
const PANEL_HEIGHT_EXPANDED = 1760;
const PANEL_EXPAND_MS = 520;
const PANEL_EXPAND_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const FULLSCREEN_MAX_WIDTH = 768;
const FULLSCREEN_MAX_HEIGHT = 540;
const PANEL_GUTTER = 16;
const FEATUL_LOGO =
  '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="transform:rotate(-90deg)"><path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M11.986.764c-5.911 0-10.75 4.597-10.75 10.34 0 2.402.866 4.62 2.315 6.37 1.918 2.383 4.932 3.91 8.301 3.95l.036.013a68 68 0 0 0 1.915.657c1.177.386 2.674.842 3.886 1.095a2.32 2.32 0 0 0 1.72-.328c.478-.31.893-.848.893-1.544 0-.412-.167-.818-.329-1.131a7 7 0 0 0-.602-.941 11 11 0 0 0-.299-.384c2.247-1.88 3.664-4.655 3.664-7.758 0-3.552-1.85-6.671-4.663-8.517-1.74-1.163-3.83-1.822-6.087-1.822m6.378 5.273a.75.75 0 1 0-1.295.758 8.5 8.5 0 0 1 1.167 4.308 8.46 8.46 0 0 1-1.167 4.299.75.75 0 0 0 1.294.758 9.96 9.96 0 0 0 1.373-5.057 10 10 0 0 0-1.372-5.066"/></svg>';

type Rect = { left: number; top: number; width: number; height: number };
type QueueItem = { type: string; payload: unknown };

type WidgetState = {
  projectId: string | null;
  options: FeatulWidgetOptions;
  user: FeatulWidgetUser | null;
  iframe: HTMLIFrameElement | null;
  button: HTMLButtonElement | null;
  shell: HTMLDivElement | null;
  lightbox: { overlay: HTMLElement; dialog: HTMLElement } | HTMLElement | null;
  position: "left" | "right";
  open: boolean;
  ready: boolean;
  expanded: boolean;
  closeTimer: number | null;
  morphTimer: number | null;
  panelAnim: Animation | null;
  animating: boolean;
  queue: QueueItem[];
  scrollLock: { html: string; body: string } | null;
  safeProbe: HTMLDivElement | null;
  dockObserver: MutationObserver | null;
  placeTimer: number | null;
  accent: string;
  theme: "light" | "dark";
  listeners: Record<WidgetHostEvent, Set<(payload?: unknown) => void>>;
};

function boot() {
  if (window.__featulWidgetLoaded) return;
  window.__featulWidgetLoaded = true;

  const script = document.currentScript as HTMLScriptElement | null;
  const baseUrl = script?.src
    ? new URL(script.src).origin
    : window.location.origin;

  const state: WidgetState = {
    projectId: null,
    options: {},
    user: null,
    iframe: null,
    button: null,
    shell: null,
    lightbox: null,
    position: "right",
    open: false,
    ready: false,
    expanded: false,
    closeTimer: null,
    morphTimer: null,
    panelAnim: null,
    animating: false,
    queue: [],
    scrollLock: null,
    safeProbe: null,
    dockObserver: null,
    placeTimer: null,
    accent: "#3b82f6",
    theme: "dark",
    listeners: { ready: new Set(), open: new Set(), close: new Set() },
  };

  function emit(event: WidgetHostEvent, payload?: unknown) {
    state.listeners[event].forEach((listener) => listener(payload));
  }

  function resolveTheme(mode?: FeatulWidgetOptions["theme"]) {
    if (mode === "light" || mode === "dark") return mode;
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches)
      return "dark";
    return "light";
  }

  function panelBackground() {
    return state.theme === "light" ? "#ffffff" : "#1a1a1c";
  }

  function launcherForeground() {
    return state.theme === "light" ? "#171717" : "#fafafa";
  }

  function syncLauncherTheme() {
    if (state.button) {
      state.button.style.background = panelBackground();
      state.button.style.color = launcherForeground();
    }
    if (state.shell && !state.open)
      state.shell.style.background = panelBackground();
  }

  function syncTheme() {
    state.theme = resolveTheme(state.options.theme || "auto");
    if (state.iframe) {
      state.iframe.style.background = panelBackground();
      state.iframe.style.colorScheme = state.theme;
    }
    if (state.shell && state.open)
      state.shell.style.background = panelBackground();
    syncLauncherTheme();
  }

  function post(type: string, payload?: unknown) {
    state.iframe?.contentWindow?.postMessage(
      createWidgetEnvelope(HOST_SOURCE, type, payload),
      baseUrl,
    );
  }

  function flush() {
    while (state.queue.length) {
      const item = state.queue.shift();
      if (item) post(item.type, item.payload);
    }
  }

  function enqueue(type: string, payload?: unknown) {
    if (state.ready) post(type, payload);
    else state.queue.push({ type, payload });
  }

  function getViewport() {
    const vv = window.visualViewport;
    if (vv && vv.width > 0 && vv.height > 0) {
      return {
        width: Math.round(vv.width),
        height: Math.round(vv.height),
        left: Math.round(vv.offsetLeft || 0),
        top: Math.round(vv.offsetTop || 0),
      };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      left: 0,
      top: 0,
    };
  }

  function isFullscreenPanel() {
    const view = getViewport();
    return (
      view.width < FULLSCREEN_MAX_WIDTH || view.height < FULLSCREEN_MAX_HEIGHT
    );
  }

  function panelCornerRadius() {
    return isFullscreenPanel() ? "0px" : PANEL_RADIUS;
  }

  function panelShadow() {
    return "none";
  }

  function syncFrameLayout() {
    if (!state.ready) return;
    post("layout", { fullscreen: isFullscreenPanel() });
  }

  function setHostScrollLocked(locked: boolean) {
    const shouldLock = Boolean(locked) && isFullscreenPanel();
    if (!shouldLock) {
      if (!state.scrollLock) return;
      document.documentElement.style.overflow = state.scrollLock.html;
      document.body.style.overflow = state.scrollLock.body;
      state.scrollLock = null;
      return;
    }
    if (state.scrollLock) return;
    state.scrollLock = {
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow,
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function getPanelRect(position: "left" | "right"): Rect {
    const view = getViewport();
    if (isFullscreenPanel()) {
      return {
        left: view.left,
        top: view.top,
        width: view.width,
        height: view.height,
      };
    }
    const preferredWidth = state.expanded ? PANEL_WIDTH_EXPANDED : PANEL_WIDTH;
    const preferredHeight = state.expanded
      ? PANEL_HEIGHT_EXPANDED
      : PANEL_HEIGHT;
    const width = Math.min(
      preferredWidth,
      Math.max(280, view.width - PANEL_GUTTER * 2),
    );
    const heightPad = 16;
    const height = Math.min(
      preferredHeight,
      Math.max(360, view.height - heightPad),
    );
    const gutter = PANEL_GUTTER;
    return {
      left:
        position === "left"
          ? view.left + gutter
          : view.left + view.width - width - gutter,
      top: view.top + view.height - height - gutter,
      width,
      height,
    };
  }

  function isWidgetHostNode(node: Node | null) {
    if (!node || !("nodeType" in node)) return false;
    if (node === state.button || node === state.shell || node === state.iframe)
      return true;
    if (state.button && node instanceof Node && state.button.contains(node))
      return true;
    if (state.shell && node instanceof Node && state.shell.contains(node))
      return true;
    return false;
  }

  function readSafeInset(side: "left" | "right" | "top" | "bottom") {
    if (!state.safeProbe?.parentNode) {
      const probe = document.createElement("div");
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText =
        "position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;visibility:hidden;" +
        "padding-top:env(safe-area-inset-top,0px);padding-right:env(safe-area-inset-right,0px);" +
        "padding-bottom:env(safe-area-inset-bottom,0px);padding-left:env(safe-area-inset-left,0px);";
      document.documentElement.appendChild(probe);
      state.safeProbe = probe;
    }
    const styles = window.getComputedStyle(state.safeProbe);
    if (side === "right") return parseFloat(styles.paddingRight) || 0;
    if (side === "left") return parseFloat(styles.paddingLeft) || 0;
    if (side === "top") return parseFloat(styles.paddingTop) || 0;
    return parseFloat(styles.paddingBottom) || 0;
  }

  function optionOffset(key: "left" | "right" | "bottom") {
    const extra = state.options.offset;
    if (!extra) return 0;
    const value = Number(extra[key]);
    return Number.isFinite(value) ? value : 0;
  }

  function dockClearanceFromNode(
    node: Element | null,
    view: ReturnType<typeof getViewport>,
  ) {
    let current: Element | null = node;
    let depth = 0;
    while (
      current &&
      current !== document.body &&
      current !== document.documentElement &&
      depth < 10
    ) {
      if (isWidgetHostNode(current)) return 0;
      const style = window.getComputedStyle(current);
      if (style.display === "none" || style.visibility === "hidden") return 0;
      if (style.position === "fixed" || style.position === "sticky") {
        const rect = current.getBoundingClientRect();
        const maxHeight = Math.min(180, view.height * 0.42);
        const atBottom = rect.bottom >= view.top + view.height - 20;
        const notFullBleed = rect.height >= 36 && rect.height <= maxHeight;
        const wide = rect.width >= Math.min(view.width * 0.42, 160);
        if (atBottom && notFullBleed && wide) {
          return Math.min(
            maxHeight,
            Math.max(0, view.top + view.height - rect.top),
          );
        }
      }
      current = current.parentElement;
      depth += 1;
    }
    return 0;
  }

  function measureBottomDockClearance() {
    const view = getViewport();
    if (typeof document.elementsFromPoint !== "function") return 0;
    const x =
      state.position === "left"
        ? view.left + Math.min(48, view.width * 0.2)
        : view.left + view.width - Math.min(48, view.width * 0.2);
    const y = view.top + view.height - 6;
    const samples = [
      [x, y],
      [view.left + view.width / 2, y],
      [x, view.top + view.height - 28],
    ];
    let clearance = 0;
    const prevEvents = state.button?.style.pointerEvents || "";
    if (state.button) state.button.style.pointerEvents = "none";
    try {
      for (const sample of samples) {
        const stack = document.elementsFromPoint(
          sample[0] || 0,
          sample[1] || 0,
        );
        for (const el of stack) {
          const lift = dockClearanceFromNode(el, view);
          if (lift > clearance) clearance = lift;
        }
      }
    } catch {
      /* ignore */
    }
    if (state.button) state.button.style.pointerEvents = prevEvents || "auto";
    return clearance;
  }

  function getLauncherOffsets() {
    const sideKey = state.position === "left" ? "left" : "right";
    const side = PANEL_GUTTER + readSafeInset(sideKey) + optionOffset(sideKey);
    const obstacle = measureBottomDockClearance();
    const bottom =
      PANEL_GUTTER +
      Math.max(readSafeInset("bottom"), obstacle) +
      optionOffset("bottom");
    return { bottom, side };
  }

  function applyLauncherPlacement() {
    if (!state.button) return;
    const offsets = getLauncherOffsets();
    state.button.style.bottom = `${offsets.bottom}px`;
    state.button.style.top = "auto";
    if (state.position === "left") {
      state.button.style.left = `${offsets.side}px`;
      state.button.style.right = "auto";
    } else {
      state.button.style.right = `${offsets.side}px`;
      state.button.style.left = "auto";
    }
  }

  function applyRect(element: HTMLElement | null, rect: Rect) {
    if (!element) return;
    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;
    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
    element.style.right = "auto";
    element.style.bottom = "auto";
  }

  function getLauncherRect(position: "left" | "right"): Rect {
    if (state.button) {
      const rect = state.button.getBoundingClientRect();
      if (rect.width && rect.height) {
        return {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        };
      }
    }
    const view = getViewport();
    const offsets = getLauncherOffsets();
    return {
      left:
        position === "left"
          ? view.left + offsets.side
          : view.left + view.width - LAUNCHER_SIZE - offsets.side,
      top: view.top + view.height - LAUNCHER_SIZE - offsets.bottom,
      width: LAUNCHER_SIZE,
      height: LAUNCHER_SIZE,
    };
  }

  function syncMorphOrigin() {
    let origin = state.position === "left" ? "bottom left" : "bottom right";
    if (state.button) {
      const panel = getPanelRect(state.position);
      const btn = state.button.getBoundingClientRect();
      if (btn.width && btn.height && panel.width && panel.height) {
        origin = `${btn.left + btn.width / 2 - panel.left}px ${btn.top + btn.height / 2 - panel.top}px`;
      }
    }
    if (state.iframe) state.iframe.style.transformOrigin = origin;
    if (state.shell) state.shell.style.transformOrigin = origin;
  }

  function setIframeScale(scale: number) {
    if (!state.iframe) return;
    state.iframe.style.transform = scale === 1 ? "none" : `scale(${scale})`;
  }

  function applyPanelRect() {
    applyRect(state.iframe, getPanelRect(state.position));
    if (!state.iframe) return;
    state.iframe.style.borderRadius = panelCornerRadius();
    state.iframe.style.boxShadow = panelShadow();
    if (state.open && !state.animating) setIframeScale(1);
  }

  function applyShellPanelRect() {
    applyRect(state.shell, getPanelRect(state.position));
    if (!state.shell) return;
    state.shell.style.borderRadius = panelCornerRadius();
    state.shell.style.background = panelBackground();
    state.shell.style.boxShadow = panelShadow();
  }

  function applyShellLauncherRect() {
    applyRect(state.shell, getLauncherRect(state.position));
    if (!state.shell) return;
    state.shell.style.borderRadius = BUTTON_RADIUS;
    state.shell.style.background = panelBackground();
    state.shell.style.boxShadow = "none";
  }

  function prefersReducedMotion() {
    return Boolean(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    );
  }

  function iframeRestTransition() {
    return `opacity 180ms ${PANEL_EXPAND_EASE}, transform ${PANEL_EXPAND_MS}ms ${PANEL_EXPAND_EASE}, border-radius ${PANEL_EXPAND_MS}ms ${PANEL_EXPAND_EASE}, box-shadow ${PANEL_EXPAND_MS}ms ${PANEL_EXPAND_EASE}`;
  }

  function launcherScaleForRect(rect: Rect) {
    const sx = LAUNCHER_SIZE / Math.max(rect.width, 1);
    const sy = LAUNCHER_SIZE / Math.max(rect.height, 1);
    return Math.max(0.04, Math.min(sx, sy));
  }

  function cancelPanelAnim() {
    if (!state.panelAnim) return;
    try {
      state.panelAnim.cancel();
    } catch {
      /* ignore */
    }
    state.panelAnim = null;
  }

  function setPanelExpanded(expanded: boolean) {
    const next = Boolean(expanded);
    if (state.expanded === next) return;
    state.expanded = next;
    if (!state.open) return;
    applyPanelRect();
    applyShellPanelRect();
    syncFrameLayout();
  }

  function clearTimers() {
    if (state.closeTimer) window.clearTimeout(state.closeTimer);
    if (state.morphTimer) window.clearTimeout(state.morphTimer);
    state.closeTimer = null;
    state.morphTimer = null;
  }

  function closeImageLightbox() {
    const closer = (window as Window & { __featulCloseHostImage?: () => void })
      .__featulCloseHostImage;
    if (typeof closer === "function") closer();
    if (!state.lightbox) return;
    const nodes =
      "overlay" in state.lightbox
        ? [state.lightbox.overlay, state.lightbox.dialog]
        : [state.lightbox];
    for (const node of nodes) node.parentNode?.removeChild(node);
    state.lightbox = null;
    document.removeEventListener("keydown", onLightboxKeydown, true);
  }

  function onLightboxKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") closeImageLightbox();
  }

  function openImageLightbox(url: string, alt: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) return;
    const opener = (
      window as Window & {
        __featulOpenHostImage?: (url: string, alt: string) => void;
      }
    ).__featulOpenHostImage;
    if (typeof opener === "function") {
      closeImageLightbox();
      opener(url, alt || "");
      return;
    }
    closeImageLightbox();
    const dark = state.theme === "dark";
    const overlay = document.createElement("div");
    overlay.setAttribute("role", "presentation");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,0.20);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);";
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "Image");
    dialog.style.cssText =
      "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2147483647;width:min(92vw,1070px);box-sizing:border-box;padding:4px;border-radius:16px;display:flex;flex-direction:column;gap:4px;outline:none;" +
      (dark
        ? "background:#171717;color:#fafafa;border:1px solid rgba(255,255,255,0.12);"
        : "background:#f4f4f5;color:#171717;border:1px solid rgba(0,0,0,0.1);");
    const img = document.createElement("img");
    img.src = url;
    img.alt = alt || "";
    img.style.cssText =
      "max-height:80dvh;width:100%;object-fit:contain;display:block;";
    overlay.onclick = () => closeImageLightbox();
    dialog.onclick = (event) => event.stopPropagation();
    dialog.appendChild(img);
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
    state.lightbox = { overlay, dialog };
    document.addEventListener("keydown", onLightboxKeydown, true);
  }

  function setButtonHidden(hidden: boolean) {
    if (!state.button) return;
    state.button.style.setProperty(
      "display",
      hidden ? "none" : "inline-flex",
      "important",
    );
    state.button.style.setProperty("opacity", hidden ? "0" : "1", "important");
    state.button.style.setProperty(
      "pointer-events",
      hidden ? "none" : "auto",
      "important",
    );
  }

  function syncButtonVisibility() {
    setButtonHidden(state.open || state.animating);
  }

  function buildFrame() {
    if (state.iframe || !state.projectId) return;
    const position = state.options.position === "left" ? "left" : "right";
    state.position = position;
    syncTheme();
    const iframe = document.createElement("iframe");
    const params = new URLSearchParams({
      parentOrigin: window.location.origin,
      theme: state.options.theme || "auto",
      position,
      section: state.options.defaultSection || "home",
    });
    if (isFullscreenPanel()) params.set("layout", "full");
    iframe.src = `${baseUrl}/widget/${encodeURIComponent(state.projectId)}/frame?${params.toString()}`;
    iframe.title = "Featul feedback widget";
    iframe.setAttribute("aria-hidden", "true");
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox",
    );
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    iframe.style.position = "fixed";
    iframe.style.border = "0";
    iframe.style.borderRadius = panelCornerRadius();
    iframe.style.boxShadow = panelShadow();
    iframe.style.overflow = "hidden";
    iframe.style.maxWidth = "100vw";
    iframe.style.maxHeight = "100dvh";
    iframe.style.zIndex = "2147483647";
    iframe.style.display = "none";
    iframe.style.opacity = "0";
    iframe.style.background = panelBackground();
    iframe.style.colorScheme = state.theme;
    document.body.appendChild(iframe);
    state.iframe = iframe;

    const shell = document.createElement("div");
    shell.setAttribute("aria-hidden", "true");
    shell.style.position = "fixed";
    shell.style.zIndex = "2147483646";
    shell.style.display = "none";
    shell.style.pointerEvents = "none";
    document.body.appendChild(shell);
    state.shell = shell;

    if (state.options.trigger !== "custom" && state.options.widget !== false) {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", "Open feedback");
      button.innerHTML = FEATUL_LOGO;
      button.style.position = "fixed";
      button.style.bottom = `${PANEL_GUTTER}px`;
      button.style[position] = `${PANEL_GUTTER}px`;
      button.style.display = "inline-flex";
      button.style.alignItems = "center";
      button.style.justifyContent = "center";
      button.style.width = `${LAUNCHER_SIZE}px`;
      button.style.height = `${LAUNCHER_SIZE}px`;
      button.style.padding = "0";
      button.style.border = "0";
      button.style.borderRadius = BUTTON_RADIUS;
      button.style.background = panelBackground();
      button.style.color = launcherForeground();
      button.style.cursor = "pointer";
      button.style.zIndex = "2147483647";
      button.style.transition =
        "bottom 220ms cubic-bezier(0.22, 1, 0.36, 1), left 220ms cubic-bezier(0.22, 1, 0.36, 1), right 220ms cubic-bezier(0.22, 1, 0.36, 1)";
      button.onclick = () => api.showWidget();
      document.body.appendChild(button);
      state.button = button;
    }
    applyLauncherPlacement();
    applyPanelRect();
    applyShellLauncherRect();
    syncButtonVisibility();
    window.requestAnimationFrame(applyLauncherPlacement);
  }

  function setOpen(open: boolean, options?: { section?: FeatulWidgetSection }) {
    buildFrame();
    state.open = open;
    if (!open) {
      cancelPanelAnim();
      state.expanded = false;
      setHostScrollLocked(false);
    } else {
      setHostScrollLocked(true);
      syncFrameLayout();
    }
    if (!state.iframe) return;
    state.iframe.setAttribute("aria-hidden", open ? "false" : "true");
    clearTimers();
    state.animating = true;
    setButtonHidden(true);
    if (open) {
      const openRect = getPanelRect(state.position);
      const openScale = launcherScaleForRect(openRect);
      applyPanelRect();
      applyShellLauncherRect();
      syncMorphOrigin();
      if (state.shell) {
        state.shell.style.display = "block";
        state.shell.style.opacity = "1";
      }
      state.iframe.style.display = "block";
      state.iframe.style.transition = "none";
      state.iframe.style.borderRadius = BUTTON_RADIUS;
      setIframeScale(openScale);
      state.iframe.style.opacity = "0";
      syncButtonVisibility();
      if (prefersReducedMotion()) {
        setIframeScale(1);
        state.iframe.style.opacity = "1";
        state.iframe.style.borderRadius = panelCornerRadius();
        if (state.shell) state.shell.style.display = "none";
        state.animating = false;
        syncButtonVisibility();
      } else {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (!state.iframe || !state.open) return;
            state.iframe.style.transition = iframeRestTransition();
            state.iframe.style.borderRadius = panelCornerRadius();
            setIframeScale(1);
            state.iframe.style.opacity = "1";
            applyShellPanelRect();
            state.morphTimer = window.setTimeout(() => {
              if (state.shell) state.shell.style.opacity = "0";
              state.closeTimer = window.setTimeout(() => {
                if (state.shell) state.shell.style.display = "none";
                state.animating = false;
                state.closeTimer = null;
                syncButtonVisibility();
              }, 160);
              state.morphTimer = null;
            }, 320);
          });
        });
      }
      emit("open", options || {});
      enqueue("show", options || {});
    } else {
      const closeRect = getPanelRect(state.position);
      const closeScale = launcherScaleForRect(closeRect);
      applyShellPanelRect();
      if (state.shell) {
        state.shell.style.display = "block";
        state.shell.style.opacity = "1";
      }
      syncButtonVisibility();
      if (prefersReducedMotion()) {
        state.iframe.style.opacity = "0";
        state.iframe.style.display = "none";
        setIframeScale(1);
        if (state.shell) state.shell.style.display = "none";
        state.animating = false;
        applyLauncherPlacement();
        setButtonHidden(false);
      } else {
        window.requestAnimationFrame(() => {
          if (state.iframe) {
            state.iframe.style.transition = iframeRestTransition();
            state.iframe.style.borderRadius = BUTTON_RADIUS;
            state.iframe.style.opacity = "0";
            setIframeScale(closeScale);
          }
          window.requestAnimationFrame(applyShellLauncherRect);
        });
        state.closeTimer = window.setTimeout(() => {
          if (state.iframe) {
            state.iframe.style.display = "none";
            state.iframe.style.transition = "none";
            setIframeScale(1);
          }
          if (state.shell) {
            state.shell.style.opacity = "0";
            state.shell.style.display = "none";
          }
          state.animating = false;
          state.closeTimer = null;
          applyLauncherPlacement();
          setButtonHidden(false);
        }, 400);
      }
      emit("close");
      enqueue("hide", {});
    }
  }

  function scheduleLauncherPlacement() {
    if (state.placeTimer) window.clearTimeout(state.placeTimer);
    state.placeTimer = window.setTimeout(() => {
      state.placeTimer = null;
      if (state.open) return;
      applyLauncherPlacement();
      applyShellLauncherRect();
    }, 120);
  }

  function bindDockObserver() {
    if (state.dockObserver || typeof MutationObserver !== "function") return;
    state.dockObserver = new MutationObserver(() => {
      if (state.open || state.animating) return;
      scheduleLauncherPlacement();
    });
    state.dockObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function onViewportChange() {
    cancelPanelAnim();
    applyLauncherPlacement();
    applyPanelRect();
    if (state.open) {
      applyShellPanelRect();
      setHostScrollLocked(true);
    } else {
      applyShellLauncherRect();
      setHostScrollLocked(false);
    }
    syncFrameLayout();
  }

  window.addEventListener("resize", onViewportChange);
  window.addEventListener("orientationchange", onViewportChange);
  window.visualViewport?.addEventListener("resize", onViewportChange);
  window.visualViewport?.addEventListener("scroll", onViewportChange);

  window.addEventListener("message", (event) => {
    if (event.origin !== baseUrl) return;
    if (
      !state.iframe ||
      !isExpectedWidgetMessageSource(event.source, state.iframe.contentWindow)
    ) {
      return;
    }
    const data = readWidgetMessage(event.data, FRAME_SOURCE);
    if (!data) return;
    if (data.type === "ready") {
      state.ready = true;
      if (state.user) post("identify", state.user);
      post("theme", {
        mode: state.options.theme || "auto",
        theme: state.theme,
      });
      post("layout", { fullscreen: isFullscreenPanel() });
      flush();
      if (state.open) post("show", {});
      emit("ready");
    }
    if (
      data.type === "theme" &&
      data.payload &&
      typeof data.payload === "object" &&
      "theme" in data.payload
    ) {
      const theme = (data.payload as { theme?: string }).theme;
      state.theme = theme === "light" ? "light" : "dark";
      if (state.iframe) state.iframe.style.colorScheme = state.theme;
      if (state.shell && state.open)
        state.shell.style.background = panelBackground();
      syncLauncherTheme();
    }
    if (data.type === "close") {
      state.expanded = false;
      setOpen(false);
    }
    if (data.type === "panel") {
      setPanelExpanded(
        Boolean(
          data.payload &&
            typeof data.payload === "object" &&
            "expanded" in data.payload &&
            (data.payload as { expanded?: unknown }).expanded,
        ),
      );
    }
    if (
      data.type === "open-image" &&
      data.payload &&
      typeof data.payload === "object" &&
      "url" in data.payload
    ) {
      const payload = data.payload as { url?: string; alt?: string };
      if (payload.url) openImageLightbox(payload.url, payload.alt || "");
    }
    if (data.type === "close-image") closeImageLightbox();
  });

  const api: FeatulWidgetApi = {
    init(projectId, options = {}) {
      const prevTheme = state.options.theme || "auto";
      const nextTheme = options.theme || "auto";
      if (state.iframe && prevTheme !== nextTheme) api.destroy();
      state.projectId = projectId;
      state.options = options;
      syncTheme();
      buildFrame();
      bindDockObserver();
      applyLauncherPlacement();
      if (state.ready)
        post("theme", {
          mode: state.options.theme || "auto",
          theme: state.theme,
        });
    },
    identify(user) {
      state.user = user || null;
      enqueue("identify", state.user);
    },
    showWidget(options) {
      setOpen(true, options || {});
    },
    hideWidget() {
      setOpen(false);
    },
    on(event, listener) {
      state.listeners[event]?.add(listener);
    },
    off(event, listener) {
      state.listeners[event]?.delete(listener);
    },
    destroy() {
      clearTimers();
      closeImageLightbox();
      setHostScrollLocked(false);
      if (state.placeTimer) window.clearTimeout(state.placeTimer);
      state.dockObserver?.disconnect();
      state.dockObserver = null;
      state.safeProbe?.parentNode?.removeChild(state.safeProbe);
      state.iframe?.parentNode?.removeChild(state.iframe);
      state.button?.parentNode?.removeChild(state.button);
      state.shell?.parentNode?.removeChild(state.shell);
      state.iframe = null;
      state.button = null;
      state.shell = null;
      state.lightbox = null;
      state.safeProbe = null;
      state.ready = false;
      state.open = false;
      state.expanded = false;
      state.animating = false;
      state.user = null;
      state.queue = [];
      state.listeners.ready.clear();
      state.listeners.open.clear();
      state.listeners.close.clear();
    },
  };

  const queued = window.$featulq || [];
  window.featul = api;
  for (const call of queued) {
    if (!Array.isArray(call)) continue;
    const method = call[0];
    if (typeof method === "string" && method in api) {
      (api as unknown as Record<string, (...args: unknown[]) => void>)[
        method
      ]?.(...(call.slice(1) as unknown[]));
    }
  }
}

boot();
