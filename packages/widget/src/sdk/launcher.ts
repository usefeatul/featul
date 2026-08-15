export const launcherSource = String.raw`
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
    iframe.style.transition = "opacity 180ms cubic-bezier(0.22, 1, 0.36, 1), left 460ms cubic-bezier(0.22, 1, 0.36, 1), top 460ms cubic-bezier(0.22, 1, 0.36, 1), width 460ms cubic-bezier(0.22, 1, 0.36, 1), height 460ms cubic-bezier(0.22, 1, 0.36, 1)";
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
    shell.style.transition = "left 460ms cubic-bezier(0.22, 1, 0.36, 1), top 460ms cubic-bezier(0.22, 1, 0.36, 1), width 460ms cubic-bezier(0.22, 1, 0.36, 1), height 460ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 460ms cubic-bezier(0.22, 1, 0.36, 1), background 220ms ease, box-shadow 460ms cubic-bezier(0.22, 1, 0.36, 1), opacity 160ms ease";
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
      button.style.width = LAUNCHER_SIZE + "px";
      button.style.height = LAUNCHER_SIZE + "px";
      button.style.padding = "0";
      button.style.border = "0";
      button.style.borderRadius = BUTTON_RADIUS;
      button.style.background = panelBackground();
      button.style.color = launcherForeground();
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
    if (!open) {
      cancelPanelAnim();
      state.expanded = false;
    }
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
    cancelPanelAnim();
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
      syncLauncherTheme();
    }
    if (data.type === "brand" && data.payload && data.payload.primaryColor) {
      applyAccent(data.payload.primaryColor);
    }
    if (data.type === "close") {
      state.expanded = false;
      setOpen(false);
    }
    if (data.type === "panel") {
      setPanelExpanded(Boolean(data.payload && data.payload.expanded));
    }
    if (data.type === "open-image" && data.payload && data.payload.url) {
      openImageLightbox(data.payload.url, data.payload.alt || "");
    }
    if (data.type === "close-image") {
      closeImageLightbox();
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
      closeImageLightbox();
      if (state.iframe && state.iframe.parentNode) state.iframe.parentNode.removeChild(state.iframe);
      if (state.button && state.button.parentNode) state.button.parentNode.removeChild(state.button);
      if (state.shell && state.shell.parentNode) state.shell.parentNode.removeChild(state.shell);
      state.iframe = null;
      state.button = null;
      state.shell = null;
      state.lightbox = null;
      state.ready = false;
      state.open = false;
      state.expanded = false;
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
`;
