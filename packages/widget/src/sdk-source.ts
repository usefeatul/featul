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
    open: false,
    ready: false,
    closeTimer: null,
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

  function buildFrame() {
    if (state.iframe || !state.projectId) return;

    var position = state.options.position === "left" ? "left" : "right";
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
    iframe.style.bottom = "20px";
    iframe.style[position] = "20px";
    iframe.style.width = "384px";
    iframe.style.height = "700px";
    iframe.style.maxWidth = "calc(100vw - 32px)";
    iframe.style.maxHeight = "calc(100vh - 40px)";
    iframe.style.border = "0";
    iframe.style.borderRadius = "18px";
    iframe.style.boxShadow = "0 24px 70px rgba(0, 0, 0, 0.36)";
    iframe.style.zIndex = "2147483646";
    iframe.style.display = "none";
    iframe.style.opacity = "0";
    iframe.style.transform = "translateY(18px) scale(0.96)";
    iframe.style.transformOrigin = position === "left" ? "bottom left" : "bottom right";
    iframe.style.transition = "opacity 180ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)";
    iframe.style.background = "transparent";
    iframe.style.colorScheme = state.options.theme === "dark" ? "dark" : "normal";
    document.body.appendChild(iframe);
    state.iframe = iframe;

    if (state.options.trigger !== "custom" && state.options.widget !== false) {
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", "Open feedback");
      button.textContent = "Feedback";
      button.style.position = "fixed";
      button.style.bottom = "20px";
      button.style[position] = "20px";
      button.style.height = "48px";
      button.style.padding = "0 18px";
      button.style.border = "0";
      button.style.borderRadius = "999px";
      button.style.background = "#ff7144";
      button.style.color = "#ffffff";
      button.style.font = "500 14px/1.2 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      button.style.boxShadow = "0 16px 40px rgba(15, 23, 42, 0.22)";
      button.style.cursor = "pointer";
      button.style.zIndex = "2147483647";
      button.onclick = function () {
        window.featul.showWidget();
      };
      document.body.appendChild(button);
      state.button = button;
    }
    syncButtonVisibility();
  }

  function syncButtonVisibility() {
    if (!state.button) return;
    state.button.style.setProperty("display", state.open ? "none" : "inline-flex", "important");
    state.button.style.setProperty("opacity", state.open ? "0" : "1", "important");
    state.button.style.setProperty("pointer-events", state.open ? "none" : "auto", "important");
  }

  function setOpen(open, options) {
    buildFrame();
    state.open = open;
    if (state.iframe) {
      state.iframe.setAttribute("aria-hidden", open ? "false" : "true");
      if (state.closeTimer) {
        window.clearTimeout(state.closeTimer);
        state.closeTimer = null;
      }
      if (open) {
        state.iframe.style.display = "block";
        window.requestAnimationFrame(function () {
          if (!state.iframe) return;
          state.iframe.style.opacity = "1";
          state.iframe.style.transform = "translateY(0) scale(1)";
        });
      } else {
        state.iframe.style.opacity = "0";
        state.iframe.style.transform = "translateY(18px) scale(0.96)";
        state.closeTimer = window.setTimeout(function () {
          if (state.iframe && !state.open) state.iframe.style.display = "none";
          state.closeTimer = null;
        }, 220);
      }
    }
    syncButtonVisibility();
    if (open) enqueue("show", options || {});
    else enqueue("hide", {});
  }

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
      if (state.closeTimer) window.clearTimeout(state.closeTimer);
      if (state.iframe && state.iframe.parentNode) state.iframe.parentNode.removeChild(state.iframe);
      if (state.button && state.button.parentNode) state.button.parentNode.removeChild(state.button);
      state.iframe = null;
      state.button = null;
      state.ready = false;
      state.open = false;
      state.closeTimer = null;
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
