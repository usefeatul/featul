export const lightboxSource = String.raw`
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
`;
