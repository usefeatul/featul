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
    return "none";
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

  function isWidgetHostNode(node) {
    if (!node || !node.nodeType) return false;
    if (node === state.button || node === state.shell || node === state.iframe) return true;
    if (state.button && state.button.contains(node)) return true;
    if (state.shell && state.shell.contains(node)) return true;
    return false;
  }

  function readSafeInset(side) {
    if (!state.safeProbe || !state.safeProbe.parentNode) {
      var probe = document.createElement("div");
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText =
        "position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;visibility:hidden;" +
        "padding-top:env(safe-area-inset-top,0px);padding-right:env(safe-area-inset-right,0px);" +
        "padding-bottom:env(safe-area-inset-bottom,0px);padding-left:env(safe-area-inset-left,0px);";
      document.documentElement.appendChild(probe);
      state.safeProbe = probe;
    }
    var styles = window.getComputedStyle(state.safeProbe);
    if (side === "right") return parseFloat(styles.paddingRight) || 0;
    if (side === "left") return parseFloat(styles.paddingLeft) || 0;
    if (side === "top") return parseFloat(styles.paddingTop) || 0;
    return parseFloat(styles.paddingBottom) || 0;
  }

  function optionOffset(key) {
    var extra = state.options && state.options.offset;
    if (!extra || typeof extra !== "object") return 0;
    var value = Number(extra[key]);
    return Number.isFinite(value) ? value : 0;
  }

  function dockClearanceFromNode(node, view) {
    var current = node;
    var depth = 0;
    while (current && current !== document.body && current !== document.documentElement && depth < 10) {
      if (isWidgetHostNode(current)) return 0;
      var style = window.getComputedStyle(current);
      if (style.display === "none" || style.visibility === "hidden") return 0;
      var position = style.position;
      if (position === "fixed" || position === "sticky") {
        var rect = current.getBoundingClientRect();
        var height = rect.height;
        var maxHeight = Math.min(180, view.height * 0.42);
        var atBottom = rect.bottom >= view.top + view.height - 20;
        var notFullBleed = height >= 36 && height <= maxHeight;
        var wide = rect.width >= Math.min(view.width * 0.42, 160);
        if (atBottom && notFullBleed && wide) {
          return Math.min(maxHeight, Math.max(0, view.top + view.height - rect.top));
        }
      }
      current = current.parentElement;
      depth += 1;
    }
    return 0;
  }

  function measureBottomDockClearance() {
    var view = getViewport();
    if (typeof document.elementsFromPoint !== "function") return 0;
    var x = state.position === "left"
      ? view.left + Math.min(48, view.width * 0.2)
      : view.left + view.width - Math.min(48, view.width * 0.2);
    var y = view.top + view.height - 6;
    var samples = [
      [x, y],
      [view.left + view.width / 2, y],
      [x, view.top + view.height - 28]
    ];
    var clearance = 0;
    var prevEvents = state.button ? state.button.style.pointerEvents : "";
    if (state.button) state.button.style.pointerEvents = "none";
    try {
      for (var i = 0; i < samples.length; i++) {
        var stack = document.elementsFromPoint(samples[i][0], samples[i][1]) || [];
        for (var j = 0; j < stack.length; j++) {
          var lift = dockClearanceFromNode(stack[j], view);
          if (lift > clearance) clearance = lift;
        }
      }
    } catch (error) {}
    if (state.button) state.button.style.pointerEvents = prevEvents || "auto";
    return clearance;
  }

  function getLauncherOffsets() {
    var sideKey = state.position === "left" ? "left" : "right";
    var side = PANEL_GUTTER + readSafeInset(sideKey) + optionOffset(sideKey);
    var obstacle = measureBottomDockClearance();
    var bottom =
      PANEL_GUTTER + Math.max(readSafeInset("bottom"), obstacle) + optionOffset("bottom");
    return { bottom: bottom, side: side };
  }

  function applyLauncherPlacement() {
    if (!state.button) return;
    var offsets = getLauncherOffsets();
    state.button.style.bottom = offsets.bottom + "px";
    state.button.style.top = "auto";
    if (state.position === "left") {
      state.button.style.left = offsets.side + "px";
      state.button.style.right = "auto";
    } else {
      state.button.style.right = offsets.side + "px";
      state.button.style.left = "auto";
    }
  }

  function syncMorphOrigin() {
    var origin = state.position === "left" ? "bottom left" : "bottom right";
    if (state.button) {
      var panel = getPanelRect(state.position);
      var btn = state.button.getBoundingClientRect();
      if (btn.width && btn.height && panel.width && panel.height) {
        origin =
          btn.left + btn.width / 2 - panel.left + "px " + (btn.top + btn.height / 2 - panel.top) + "px";
      }
    }
    if (state.iframe) state.iframe.style.transformOrigin = origin;
    if (state.shell) state.shell.style.transformOrigin = origin;
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
    var offsets = getLauncherOffsets();
    return {
      left: position === "left" ? view.left + offsets.side : view.left + view.width - width - offsets.side,
      top: view.top + view.height - height - offsets.bottom,
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
