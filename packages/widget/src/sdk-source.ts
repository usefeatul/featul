export function getWidgetSdkSource() {
  return String.raw`
(function () {
  if (window.__featulWidgetLoaded) return;
  window.__featulWidgetLoaded = true;

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
    var preferredWidth = state.expanded ? PANEL_WIDTH_EXPANDED : PANEL_WIDTH;
    var preferredHeight = state.expanded ? PANEL_HEIGHT_EXPANDED : PANEL_HEIGHT;
    var width = Math.min(preferredWidth, Math.max(280, window.innerWidth - 32));
    var heightPad = state.expanded ? 24 : 40;
    var height = Math.min(preferredHeight, Math.max(360, window.innerHeight - heightPad));
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
    var width = LAUNCHER_SIZE;
    var height = LAUNCHER_SIZE;
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

  function readRect(element, fallback) {
    if (!element) return fallback;
    var left = parseFloat(element.style.left);
    var top = parseFloat(element.style.top);
    var width = parseFloat(element.style.width);
    var height = parseFloat(element.style.height);
    if (
      Number.isFinite(left) &&
      Number.isFinite(top) &&
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width > 0 &&
      height > 0
    ) {
      return { left: left, top: top, width: width, height: height };
    }
    var box = element.getBoundingClientRect();
    if (box.width > 0 && box.height > 0) {
      return { left: box.left, top: box.top, width: box.width, height: box.height };
    }
    return fallback;
  }

  function cancelPanelAnim() {
    if (!state.panelAnim) return;
    try {
      state.panelAnim.cancel();
    } catch (error) {}
    state.panelAnim = null;
  }

  function animatePanelRect(toRect) {
    if (!state.iframe) {
      applyRect(state.shell, toRect);
      return;
    }
    cancelPanelAnim();
    var fromRect = readRect(state.iframe, toRect);
    var reduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof state.iframe.animate !== "function") {
      applyRect(state.iframe, toRect);
      applyRect(state.shell, toRect);
      return;
    }

    var prevTransition = state.iframe.style.transition;
    state.iframe.style.transition = "none";
    applyRect(state.iframe, fromRect);

    var animation = state.iframe.animate(
      [
        {
          left: fromRect.left + "px",
          top: fromRect.top + "px",
          width: fromRect.width + "px",
          height: fromRect.height + "px"
        },
        {
          left: toRect.left + "px",
          top: toRect.top + "px",
          width: toRect.width + "px",
          height: toRect.height + "px"
        }
      ],
      {
        duration: PANEL_EXPAND_MS,
        easing: PANEL_EXPAND_EASE,
        fill: "forwards"
      }
    );
    state.panelAnim = animation;
    applyRect(state.shell, toRect);

    var finish = function () {
      if (state.panelAnim !== animation) return;
      applyRect(state.iframe, toRect);
      state.iframe.style.transition = prevTransition;
      try {
        animation.cancel();
      } catch (error) {}
      state.panelAnim = null;
    };
    animation.onfinish = finish;
    animation.oncancel = function () {
      if (state.iframe) state.iframe.style.transition = prevTransition;
      if (state.panelAnim === animation) state.panelAnim = null;
    };
  }

  function setPanelExpanded(expanded) {
    var next = Boolean(expanded);
    if (state.expanded === next) return;
    state.expanded = next;
    if (!state.open) return;
    var rect = getPanelRect(state.position);
    if (state.iframe) state.iframe.style.borderRadius = PANEL_RADIUS;
    if (state.shell) {
      state.shell.style.borderRadius = PANEL_RADIUS;
      state.shell.style.background = panelBackground();
    }
    animatePanelRect(rect);
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
    state.shell.style.background = panelBackground();
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

  function closeImageLightbox() {
    if (typeof window.__featulCloseHostImage === "function") {
      window.__featulCloseHostImage();
    }
    if (!state.lightbox) return;
    var nodes = state.lightbox.overlay
      ? [state.lightbox.overlay, state.lightbox.dialog]
      : [state.lightbox];
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node && node.parentNode) node.parentNode.removeChild(node);
    }
    state.lightbox = null;
    document.removeEventListener("keydown", onLightboxKeydown, true);
  }

  function onLightboxKeydown(event) {
    if (event.key === "Escape") closeImageLightbox();
  }

  function openImageLightbox(url, alt) {
    if (!url || typeof url !== "string") return;
    if (url.indexOf("http://") !== 0 && url.indexOf("https://") !== 0) return;

    // Prefer the host app dialog when available (exact workspace SettingsDialogShell).
    if (typeof window.__featulOpenHostImage === "function") {
      closeImageLightbox();
      window.__featulOpenHostImage(url, alt || "");
      return;
    }

    closeImageLightbox();

    var dark = state.theme === "dark";
    var overlay = document.createElement("div");
    overlay.setAttribute("role", "presentation");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,0.20);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);";

    var dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "Image");
    dialog.style.cssText =
      "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2147483647;width:min(92vw,1070px);box-sizing:border-box;padding:4px;border-radius:16px;display:flex;flex-direction:column;gap:4px;outline:none;" +
      (dark
        ? "background:#171717;color:#fafafa;border:1px solid rgba(255,255,255,0.12);box-shadow:0 10px 40px rgba(0,0,0,0.55);"
        : "background:#f4f4f5;color:#171717;border:1px solid rgba(0,0,0,0.1);box-shadow:0 10px 40px rgba(0,0,0,0.18);");

    var header = document.createElement("div");
    header.style.cssText =
      "display:flex;align-items:center;justify-content:space-between;gap:8px;padding:2px 8px;min-height:28px;";

    var titleWrap = document.createElement("div");
    titleWrap.style.cssText = "display:inline-flex;align-items:center;gap:8px;font:400 14px/1.2 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;";
    titleWrap.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 18 18" aria-hidden="true" fill="currentColor"><path d="M13.194,8.384c-1.072-1.072-2.816-1.072-3.889,0L3.196,14.494c.367,.457,.923,.756,1.554,.756H13.25c1.105,0,2-.896,2-2v-2.811l-2.056-2.056Z"/><circle cx="6.25" cy="7.25" r="1.25"/><path d="M13.25,16H4.75c-1.517,0-2.75-1.233-2.75-2.75V4.75c0-1.517,1.233-2.75,2.75-2.75H13.25c1.517,0,2.75,1.233,2.75,2.75V13.25c0,1.517-1.233,2.75-2.75,2.75ZM4.75,3.5c-.689,0-1.25,.561-1.25,1.25V13.25c0,.689,.561,1.25,1.25,1.25H13.25c.689,0,1.25-.561,1.25-1.25V4.75c0-.689-.561-1.25-1.25-1.25H4.75Z"/></svg><span>Image</span>';

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    closeBtn.style.cssText =
      "display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border:0;border-radius:4px;background:transparent;color:inherit;opacity:0.7;cursor:pointer;";

    var body = document.createElement("div");
    body.style.cssText =
      "border-radius:12px;padding:8px;border:1px solid " +
      (dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)") +
      ";" +
      (dark ? "background:rgba(0,0,0,0.6);" : "background:#ffffff;");

    var imageWrap = document.createElement("div");
    imageWrap.style.cssText =
      "display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:8px;" +
      (dark ? "background:rgba(255,255,255,0.04);" : "background:rgba(0,0,0,0.04);");

    var img = document.createElement("img");
    img.src = url;
    img.alt = alt || "";
    img.style.cssText = "max-height:80dvh;width:100%;object-fit:contain;display:block;";

    closeBtn.onclick = function (event) {
      event.stopPropagation();
      closeImageLightbox();
    };
    overlay.onclick = function () {
      closeImageLightbox();
    };
    dialog.onclick = function (event) {
      event.stopPropagation();
    };

    header.appendChild(titleWrap);
    header.appendChild(closeBtn);
    imageWrap.appendChild(img);
    body.appendChild(imageWrap);
    dialog.appendChild(header);
    dialog.appendChild(body);
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
    state.lightbox = { overlay: overlay, dialog: dialog };
    document.addEventListener("keydown", onLightboxKeydown, true);
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
})();`;
}
