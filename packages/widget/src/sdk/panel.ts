export const panelSource = String.raw`
  function getViewport() {
    var vv = window.visualViewport;
    if (vv && vv.width > 0 && vv.height > 0) {
      return {
        width: Math.round(vv.width),
        height: Math.round(vv.height),
        left: Math.round(vv.offsetLeft || 0),
        top: Math.round(vv.offsetTop || 0)
      };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      left: 0,
      top: 0
    };
  }

  function isFullscreenPanel() {
    var view = getViewport();
    return view.width < FULLSCREEN_MAX_WIDTH || view.height < FULLSCREEN_MAX_HEIGHT;
  }

  function panelCornerRadius() {
    return isFullscreenPanel() ? "0px" : PANEL_RADIUS;
  }

  function panelShadow() {
    return isFullscreenPanel() ? "none" : "0 24px 70px rgba(0, 0, 0, 0.36)";
  }

  function syncFrameLayout() {
    if (!state.ready) return;
    post("layout", { fullscreen: isFullscreenPanel() });
  }

  function setHostScrollLocked(locked) {
    var shouldLock = Boolean(locked) && isFullscreenPanel();
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
      body: document.body.style.overflow
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function getPanelRect(position) {
    var view = getViewport();
    if (isFullscreenPanel()) {
      return {
        left: view.left,
        top: view.top,
        width: view.width,
        height: view.height
      };
    }
    var preferredWidth = state.expanded ? PANEL_WIDTH_EXPANDED : PANEL_WIDTH;
    var preferredHeight = state.expanded ? PANEL_HEIGHT_EXPANDED : PANEL_HEIGHT;
    var width = Math.min(preferredWidth, Math.max(280, view.width - PANEL_GUTTER * 2));
    var heightPad = state.expanded ? 24 : 40;
    var height = Math.min(preferredHeight, Math.max(360, view.height - heightPad));
    var gutter = PANEL_GUTTER;
    return {
      left: position === "left" ? view.left + gutter : view.left + view.width - width - gutter,
      top: view.top + view.height - height - gutter,
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
    var view = getViewport();
    var width = LAUNCHER_SIZE;
    var height = LAUNCHER_SIZE;
    var gutter = PANEL_GUTTER;
    return {
      left: position === "left" ? view.left + gutter : view.left + view.width - width - gutter,
      top: view.top + view.height - height - gutter,
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
    var radius = panelCornerRadius();
    if (state.iframe) {
      state.iframe.style.borderRadius = radius;
      state.iframe.style.boxShadow = panelShadow();
    }
    if (state.shell) {
      state.shell.style.borderRadius = radius;
      state.shell.style.background = panelBackground();
      state.shell.style.boxShadow = panelShadow();
    }
    animatePanelRect(rect);
    syncFrameLayout();
  }

  function applyFrameRect(rect) {
    applyRect(state.iframe, rect);
  }

  function applyPanelRect() {
    applyFrameRect(getPanelRect(state.position));
    if (!state.iframe) return;
    state.iframe.style.borderRadius = panelCornerRadius();
    state.iframe.style.boxShadow = panelShadow();
    if (state.open && !state.animating) setIframeScale(1);
  }

  function applyLauncherRect() {
    applyFrameRect(getLauncherRect(state.position));
    if (state.iframe) state.iframe.style.borderRadius = BUTTON_RADIUS;
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
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function iframeRestTransition() {
    return "opacity 180ms " + PANEL_EXPAND_EASE + ", transform " + PANEL_EXPAND_MS + "ms " + PANEL_EXPAND_EASE + ", border-radius " + PANEL_EXPAND_MS + "ms " + PANEL_EXPAND_EASE + ", box-shadow " + PANEL_EXPAND_MS + "ms " + PANEL_EXPAND_EASE;
  }

  function launcherScaleForRect(rect) {
    var sx = LAUNCHER_SIZE / Math.max(rect.width, 1);
    var sy = LAUNCHER_SIZE / Math.max(rect.height, 1);
    return Math.max(0.04, Math.min(sx, sy));
  }

  function setIframeScale(scale) {
    if (!state.iframe) return;
    state.iframe.style.transform = scale === 1 ? "none" : "scale(" + scale + ")";
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
`;
