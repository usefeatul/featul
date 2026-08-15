import { launcherSource } from "./launcher";
import { lightboxSource } from "./lightbox";
import { messagingSource } from "./messaging";
import { panelSource } from "./panel";

const bootSource = String.raw`
  var script = document.currentScript;
  var baseUrl = script && script.src ? new URL(script.src).origin : window.location.origin;
  var PANEL_RADIUS = "12px";
  var BUTTON_RADIUS = "8px";
  var LAUNCHER_SIZE = 36;
  var FEATUL_LOGO =
    '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="transform:rotate(-90deg)"><path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M11.986.764c-5.911 0-10.75 4.597-10.75 10.34 0 2.402.866 4.62 2.315 6.37 1.918 2.383 4.932 3.91 8.301 3.95l.036.013a68 68 0 0 0 1.915.657c1.177.386 2.674.842 3.886 1.095a2.32 2.32 0 0 0 1.72-.328c.478-.31.893-.848.893-1.544 0-.412-.167-.818-.329-1.131a7 7 0 0 0-.602-.941 11 11 0 0 0-.299-.384c2.247-1.88 3.664-4.655 3.664-7.758 0-3.552-1.85-6.671-4.663-8.517-1.74-1.163-3.83-1.822-6.087-1.822m6.378 5.273a.75.75 0 1 0-1.295.758 8.5 8.5 0 0 1 1.167 4.308 8.46 8.46 0 0 1-1.167 4.299.75.75 0 0 0 1.294.758 9.96 9.96 0 0 0 1.373-5.057 10 10 0 0 0-1.372-5.066"/></svg>';

  var PANEL_WIDTH = 384;
  var PANEL_WIDTH_EXPANDED = 480;
  var PANEL_HEIGHT = 640;
  var PANEL_HEIGHT_EXPANDED = 760;
  var PANEL_EXPAND_MS = 520;
  var PANEL_EXPAND_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  var state = {
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
    accent: "#3b82f6",
    theme: "dark"
  };

  function resolveTheme(mode) {
    if (mode === "light" || mode === "dark") return mode;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
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
    if (state.shell && !state.open) {
      state.shell.style.background = panelBackground();
    }
  }

  function syncTheme() {
    state.theme = resolveTheme((state.options && state.options.theme) || "auto");
    if (state.iframe) {
      state.iframe.style.background = "transparent";
      state.iframe.style.colorScheme = state.theme;
    }
    if (state.shell && state.open) {
      state.shell.style.background = panelBackground();
    }
    syncLauncherTheme();
  }
`;

export function getWidgetSdkSource() {
  return [
    "(function () {",
    "  if (window.__featulWidgetLoaded) return;",
    "  window.__featulWidgetLoaded = true;",
    bootSource,
    messagingSource,
    panelSource,
    lightboxSource,
    launcherSource,
    "})();",
  ].join("\n");
}
