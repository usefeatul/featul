export function getWidgetSdkSource() {
  return String.raw`
(function () {
  if (window.__featulWidgetLoaded) return;
  window.__featulWidgetLoaded = true;

  var script = document.currentScript;
  var baseUrl = script && script.src ? new URL(script.src).origin : window.location.origin;
  var PANEL_RADIUS = "12px";
  var BUTTON_RADIUS = "6px";
  var LAUNCHER_BG = "#000000";
  var FEATUL_LOGO =
    '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="transform:rotate(-90deg)"><path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M11.986.764c-5.911 0-10.75 4.597-10.75 10.34 0 2.402.866 4.62 2.315 6.37 1.918 2.383 4.932 3.91 8.301 3.95l.036.013a68 68 0 0 0 1.915.657c1.177.386 2.674.842 3.886 1.095a2.32 2.32 0 0 0 1.72-.328c.478-.31.893-.848.893-1.544 0-.412-.167-.818-.329-1.131a7 7 0 0 0-.602-.941 11 11 0 0 0-.299-.384c2.247-1.88 3.664-4.655 3.664-7.758 0-3.552-1.85-6.671-4.663-8.517-1.74-1.163-3.83-1.822-6.087-1.822m6.378 5.273a.75.75 0 1 0-1.295.758 8.5 8.5 0 0 1 1.167 4.308 8.46 8.46 0 0 1-1.167 4.299.75.75 0 0 0 1.294.758 9.96 9.96 0 0 0 1.373-5.057 10 10 0 0 0-1.372-5.066"/></svg>';

  var state = {
    projectId: null,
    options: {},
    user: null,
    iframe: null,
    button: null,
    shell: null,
    position: "right",
    open: false,
    ready: false,
    closeTimer: null,
    morphTimer: null,
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
    return state.theme === "light" ? "#ffffff" : "#000000";
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
  }

  function post(type, payload) {
    if (!state.iframe || !state.iframe.contentWindow) return;
    state.iframe.contentWindow.postMessage({
      source: "featul-widget",
      type: type,
      payload: payload || {}
    }, baseUrl);
  }

  function flush() {
    while (state.queue.length) {
      var item = state.queue.shift();
      post(item.type, item.payload);
    }
  }

  function enqueue(type, payload) {
    if (state.ready) post(type, payload);
    else state.queue.push({ type: type, payload: payload });
  }

  function getPanelRect(position) {
    var width = Math.min(384, Math.max(280, window.innerWidth - 32));
    var height = Math.min(700, Math.max(360, window.innerHeight - 40));
    return {
      left: position === "left" ? 20 : window.innerWidth - width - 20,
      top: window.innerHeight - height - 20,
      width: width,
      height: height
    };
  }

  function getLauncherRect(position) {
    if (state.button) {
      var rect = state.button.getBoundingClientRect();
      if (rect.width && rect.height) {
        return {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        };
      }
    }
    var width = 52;
    var height = 52;
    return {
      left: position === "left" ? 20 : window.innerWidth - width - 20,
      top: window.innerHeight - height - 20,
      width: width,
      height: height
    };
  }

  function applyRect(element, rect) {
    if (!element) return;
    element.style.left = rect.left + "px";
    element.style.top = rect.top + "px";
    element.style.width = rect.width + "px";
    element.style.height = rect.height + "px";
    element.style.right = "auto";
    element.style.bottom = "auto";
  }

  function applyFrameRect(rect) {
    applyRect(state.iframe, rect);
  }

  function applyPanelRect() {
    applyFrameRect(getPanelRect(state.position));
    if (state.iframe) state.iframe.style.borderRadius = PANEL_RADIUS;
  }

  function applyLauncherRect() {
    applyFrameRect(getLauncherRect(state.position));
    if (state.iframe) state.iframe.style.borderRadius = BUTTON_RADIUS;
  }

  function applyShellPanelRect() {
    applyRect(state.shell, getPanelRect(state.position));
    if (!state.shell) return;
    state.shell.style.borderRadius = PANEL_RADIUS;
    state.shell.style.background = panelBackground();
    state.shell.style.boxShadow = "0 24px 70px rgba(0, 0, 0, 0.36)";
  }

  function applyShellLauncherRect() {
    applyRect(state.shell, getLauncherRect(state.position));
    if (!state.shell) return;
    state.shell.style.borderRadius = BUTTON_RADIUS;
    state.shell.style.background = LAUNCHER_BG;
    state.shell.style.boxShadow = "none";
  }

  function applyAccent(color) {
    if (!color) return;
    state.accent = color;
  }

  function clearTimers() {
    if (state.closeTimer) window.clearTimeout(state.closeTimer);
    if (state.morphTimer) window.clearTimeout(state.morphTimer);
    state.closeTimer = null;
    state.morphTimer = null;
  }

  function buildFrame() {
    if (state.iframe || !state.projectId) return;

    var position = state.options.position === "left" ? "left" : "right";
    state.position = position;
    syncTheme();
    var iframe = document.createElement("iframe");
    var params = new URLSearchParams({
      parentOrigin: window.location.origin,
      theme: state.options.theme || "auto",
      position: position,
      section: state.options.defaultSection || "home"
    });
    iframe.src = baseUrl + "/widget/" + encodeURIComponent(state.projectId) + "/frame?" + params.toString();
    iframe.title = "Featul feedback widget";
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.border = "0";
    iframe.style.borderRadius = PANEL_RADIUS;
    iframe.style.boxShadow = "0 24px 70px rgba(0, 0, 0, 0.36)";
    iframe.style.zIndex = "2147483646";
    iframe.style.display = "none";
    iframe.style.opacity = "0";
    iframe.style.transformOrigin = position === "left" ? "bottom left" : "bottom right";
    iframe.style.transition = "opacity 180ms cubic-bezier(0.22, 1, 0.36, 1)";
    iframe.style.background = "transparent";
    iframe.style.colorScheme = state.theme;
    document.body.appendChild(iframe);
    state.iframe = iframe;

    var shell = document.createElement("div");
    shell.setAttribute("aria-hidden", "true");
    shell.style.position = "fixed";
    shell.style.border = "0";
    shell.style.borderRadius = BUTTON_RADIUS;
    shell.style.zIndex = "2147483647";
    shell.style.display = "none";
    shell.style.opacity = "0";
    shell.style.pointerEvents = "none";
    shell.style.transformOrigin = position === "left" ? "bottom left" : "bottom right";
    shell.style.transition = "left 380ms cubic-bezier(0.32, 0.72, 0, 1), top 380ms cubic-bezier(0.32, 0.72, 0, 1), width 380ms cubic-bezier(0.32, 0.72, 0, 1), height 380ms cubic-bezier(0.32, 0.72, 0, 1), border-radius 380ms cubic-bezier(0.32, 0.72, 0, 1), background 220ms ease, box-shadow 380ms cubic-bezier(0.32, 0.72, 0, 1), opacity 160ms ease";
    document.body.appendChild(shell);
    state.shell = shell;

    if (state.options.trigger !== "custom" && state.options.widget !== false) {
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", "Open feedback");
      button.innerHTML = FEATUL_LOGO;
      button.style.position = "fixed";
      button.style.bottom = "20px";
      button.style[position] = "20px";
      button.style.alignItems = "center";
      button.style.justifyContent = "center";
      button.style.boxSizing = "border-box";
      button.style.width = "52px";
      button.style.height = "52px";
      button.style.padding = "0";
      button.style.border = "0";
      button.style.borderRadius = BUTTON_RADIUS;
      button.style.background = LAUNCHER_BG;
      button.style.color = "#ffffff";
      button.style.font = "600 14px/1 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      button.style.letterSpacing = "0";
      button.style.whiteSpace = "nowrap";
      button.style.boxShadow = "none";
      button.style.cursor = "pointer";
      button.style.userSelect = "none";
      button.style.zIndex = "2147483647";
      button.onclick = function () {
        window.featul.showWidget();
      };
      document.body.appendChild(button);
      state.button = button;
    }
    applyPanelRect();
    applyShellLauncherRect();
    syncButtonVisibility();
  }

  function syncButtonVisibility() {
    var hidden = state.open || state.animating;
    setButtonHidden(hidden);
  }

  function setButtonHidden(hidden) {
    if (!state.button) return;
    state.button.style.setProperty("display", hidden ? "none" : "inline-flex", "important");
    state.button.style.setProperty("opacity", hidden ? "0" : "1", "important");
    state.button.style.setProperty("pointer-events", hidden ? "none" : "auto", "important");
  }

  function setOpen(open, options) {
    buildFrame();
    state.open = open;
    if (state.iframe) {
      state.iframe.setAttribute("aria-hidden", open ? "false" : "true");
      clearTimers();
      state.animating = true;
      setButtonHidden(true);
      if (open) {
        applyPanelRect();
        applyShellLauncherRect();
        if (state.shell) {
          state.shell.style.display = "block";
          state.shell.style.opacity = "1";
        }
        state.iframe.style.display = "block";
        state.iframe.style.opacity = "0";
        syncButtonVisibility();
        window.requestAnimationFrame(function () {
          applyShellPanelRect();
        });
        state.morphTimer = window.setTimeout(function () {
          if (state.iframe && state.open) state.iframe.style.opacity = "1";
          if (state.shell) state.shell.style.opacity = "0";
          state.closeTimer = window.setTimeout(function () {
            if (state.shell) state.shell.style.display = "none";
            state.animating = false;
            state.closeTimer = null;
            syncButtonVisibility();
          }, 160);
          state.morphTimer = null;
        }, 380);
      } else {
        // Cover the iframe with an opaque shell first so the page never flashes through.
        applyShellPanelRect();
        if (state.shell) {
          state.shell.style.display = "block";
          state.shell.style.opacity = "1";
        }
        syncButtonVisibility();
        window.requestAnimationFrame(function () {
          if (state.iframe) {
            state.iframe.style.opacity = "0";
            state.iframe.style.display = "none";
          }
          window.requestAnimationFrame(function () {
            applyShellLauncherRect();
          });
        });
        state.closeTimer = window.setTimeout(function () {
          if (state.shell) {
            state.shell.style.opacity = "0";
            state.shell.style.display = "none";
          }
          state.animating = false;
          state.closeTimer = null;
          setButtonHidden(false);
        }, 400);
      }
    }
    if (open) enqueue("show", options || {});
    else enqueue("hide", {});
  }

  window.addEventListener("resize", function () {
    applyPanelRect();
    if (state.open) applyShellPanelRect();
    else applyShellLauncherRect();
  });

  function bindThemeMedia() {
    if (!window.matchMedia) return;
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function () {
      var mode = (state.options && state.options.theme) || "auto";
      if (mode !== "auto") return;
      syncTheme();
      if (state.open) applyShellPanelRect();
      if (state.iframe && state.iframe.contentWindow) {
        post("theme", { mode: "auto", theme: state.theme });
      }
    };
    if (typeof media.addEventListener === "function") media.addEventListener("change", onChange);
    else if (typeof media.addListener === "function") media.addListener(onChange);
  }
  bindThemeMedia();

  window.addEventListener("message", function (event) {
    if (event.origin !== baseUrl) return;
    var data = event.data || {};
    if (!data || data.source !== "featul-widget-frame") return;
    if (data.type === "ready") {
      state.ready = true;
      if (state.user) post("identify", state.user);
      post("theme", {
        mode: (state.options && state.options.theme) || "auto",
        theme: state.theme
      });
      flush();
      if (state.open) post("show", {});
    }
    if (data.type === "theme" && data.payload && data.payload.theme) {
      state.theme = data.payload.theme === "light" ? "light" : "dark";
      if (state.iframe) state.iframe.style.colorScheme = state.theme;
      if (state.shell && state.open) state.shell.style.background = panelBackground();
    }
    if (data.type === "brand" && data.payload && data.payload.primaryColor) {
      applyAccent(data.payload.primaryColor);
    }
    if (data.type === "close") {
      setOpen(false);
    }
  });

  var api = {
    init: function (projectId, options) {
      var nextOptions = options || {};
      var prevTheme = (state.options && state.options.theme) || "auto";
      var nextTheme = nextOptions.theme || "auto";
      if (state.iframe && prevTheme !== nextTheme) {
        api.destroy();
      }
      state.projectId = projectId;
      state.options = nextOptions;
      syncTheme();
      buildFrame();
      if (state.ready) {
        post("theme", {
          mode: (state.options && state.options.theme) || "auto",
          theme: state.theme
        });
      }
    },
    identify: function (user) {
      state.user = user || null;
      enqueue("identify", state.user);
    },
    showWidget: function (options) {
      setOpen(true, options || {});
    },
    hideWidget: function () {
      setOpen(false);
    },
    destroy: function () {
      clearTimers();
      if (state.iframe && state.iframe.parentNode) state.iframe.parentNode.removeChild(state.iframe);
      if (state.button && state.button.parentNode) state.button.parentNode.removeChild(state.button);
      if (state.shell && state.shell.parentNode) state.shell.parentNode.removeChild(state.shell);
      state.iframe = null;
      state.button = null;
      state.shell = null;
      state.ready = false;
      state.open = false;
      state.closeTimer = null;
      state.morphTimer = null;
      state.animating = false;
      state.queue = [];
    }
  };

  var queued = window.$featulq || [];
  window.featul = api;
  queued.forEach(function (call) {
    if (!Array.isArray(call)) return;
    var method = call[0];
    if (api[method]) api[method].apply(api, call.slice(1));
  });
})();`;
}
