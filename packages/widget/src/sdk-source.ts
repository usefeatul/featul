export function getWidgetSdkSource() {
  return String.raw`
(function () {
  if (window.__featulWidgetLoaded) return;
  window.__featulWidgetLoaded = true;

  var script = document.currentScript;
  var baseUrl = script && script.src ? new URL(script.src).origin : window.location.origin;
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
    queue: []
  };

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
    if (state.iframe) state.iframe.style.borderRadius = "18px";
  }

  function applyLauncherRect() {
    applyFrameRect(getLauncherRect(state.position));
    if (state.iframe) state.iframe.style.borderRadius = "999px";
  }

  function applyShellPanelRect() {
    applyRect(state.shell, getPanelRect(state.position));
    if (!state.shell) return;
    state.shell.style.borderRadius = "18px";
    state.shell.style.background = "#171717";
    state.shell.style.boxShadow = "0 24px 70px rgba(0, 0, 0, 0.36)";
  }

  function applyShellLauncherRect() {
    applyRect(state.shell, getLauncherRect(state.position));
    if (!state.shell) return;
    state.shell.style.borderRadius = "999px";
    state.shell.style.background = "#ff7144";
    state.shell.style.boxShadow = "none";
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
    iframe.style.borderRadius = "18px";
    iframe.style.boxShadow = "0 24px 70px rgba(0, 0, 0, 0.36)";
    iframe.style.zIndex = "2147483646";
    iframe.style.display = "none";
    iframe.style.opacity = "0";
    iframe.style.transformOrigin = position === "left" ? "bottom left" : "bottom right";
    iframe.style.transition = "opacity 120ms ease";
    iframe.style.background = "#171717";
    iframe.style.colorScheme = state.options.theme === "dark" ? "dark" : "normal";
    document.body.appendChild(iframe);
    state.iframe = iframe;

    var shell = document.createElement("div");
    shell.setAttribute("aria-hidden", "true");
    shell.style.position = "fixed";
    shell.style.border = "0";
    shell.style.borderRadius = "999px";
    shell.style.zIndex = "2147483647";
    shell.style.display = "none";
    shell.style.opacity = "0";
    shell.style.pointerEvents = "none";
    shell.style.transformOrigin = position === "left" ? "bottom left" : "bottom right";
    shell.style.transition = "left 300ms cubic-bezier(0.16, 1, 0.3, 1), top 300ms cubic-bezier(0.16, 1, 0.3, 1), width 300ms cubic-bezier(0.16, 1, 0.3, 1), height 300ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 300ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms ease, box-shadow 300ms ease, opacity 140ms ease";
    document.body.appendChild(shell);
    state.shell = shell;

    if (state.options.trigger !== "custom" && state.options.widget !== false) {
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", "Open feedback");
      button.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 17.5h-.75A2.75 2.75 0 0 1 2 14.75v-7.5A2.75 2.75 0 0 1 4.75 4.5h14.5A2.75 2.75 0 0 1 22 7.25v7.5a2.75 2.75 0 0 1-2.75 2.75h-8.5L6.6 21.05A.65.65 0 0 1 5.5 20.58V17.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7.25 10.25h9.5M7.25 13.25h6.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
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
      button.style.borderRadius = "999px";
      button.style.background = "#ff7144";
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
          }, 140);
          state.morphTimer = null;
        }, 300);
      } else {
        if (state.iframe) state.iframe.style.opacity = "0";
        applyShellPanelRect();
        if (state.shell) {
          state.shell.style.display = "block";
          state.shell.style.opacity = "1";
        }
        syncButtonVisibility();
        window.requestAnimationFrame(function () {
          applyShellLauncherRect();
        });
        state.closeTimer = window.setTimeout(function () {
          if (state.iframe && !state.open) {
            state.iframe.style.display = "none";
          }
          if (state.shell) {
            state.shell.style.opacity = "0";
            state.shell.style.display = "none";
          }
          state.animating = false;
          state.closeTimer = null;
          setButtonHidden(false);
        }, 320);
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

  window.addEventListener("message", function (event) {
    if (event.origin !== baseUrl) return;
    var data = event.data || {};
    if (!data || data.source !== "featul-widget-frame") return;
    if (data.type === "ready") {
      state.ready = true;
      if (state.user) post("identify", state.user);
      flush();
      if (state.open) post("show", {});
    }
    if (data.type === "close") {
      setOpen(false);
    }
  });

  var api = {
    init: function (projectId, options) {
      state.projectId = projectId;
      state.options = options || {};
      buildFrame();
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
