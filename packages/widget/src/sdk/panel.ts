export const panelSource = String.raw`
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
`;
