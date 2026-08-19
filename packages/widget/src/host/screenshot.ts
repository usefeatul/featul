import html2canvas from "html2canvas-pro";

export const SCREENSHOT_MAX_BYTES = 1.5 * 1024 * 1024;
const JPEG_QUALITIES = [0.82, 0.7, 0.55, 0.42];

export type ScreenshotErrorCode = "cancelled" | "capture-failed";

export class ScreenshotCaptureError extends Error {
  code: ScreenshotErrorCode;
  constructor(code: ScreenshotErrorCode, message?: string) {
    super(message || code);
    this.code = code;
    this.name = "ScreenshotCaptureError";
  }
}

export function isWidgetScreenshotDataUrl(value: string): boolean {
  return (
    /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(value) &&
    value.length > 32 &&
    value.length < 12_000_000
  );
}

export function estimateDataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const payload = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.ceil((payload.length * 3) / 4);
}

export function jpegDataUrlFromCanvas(
  canvas: HTMLCanvasElement,
  maxBytes = SCREENSHOT_MAX_BYTES,
): string {
  for (const quality of JPEG_QUALITIES) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (estimateDataUrlBytes(dataUrl) <= maxBytes) return dataUrl;
  }
  return canvas.toDataURL(
    "image/jpeg",
    JPEG_QUALITIES[JPEG_QUALITIES.length - 1],
  );
}

function waitFrames(count: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) => {
      if (left <= 0) {
        resolve();
        return;
      }
      window.requestAnimationFrame(() => step(left - 1));
    };
    step(count);
  });
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isSameOriginUrl(value: string): boolean {
  if (!value || value.startsWith("data:") || value.startsWith("blob:")) {
    return true;
  }
  try {
    return new URL(value, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

function wouldTaintCanvas(element: Element): boolean {
  if (element instanceof HTMLImageElement) {
    const src = element.currentSrc || element.src;
    return Boolean(src) && !isSameOriginUrl(src);
  }
  if (element instanceof HTMLVideoElement) return true;
  if (element instanceof SVGImageElement) {
    const href = element.href.baseVal || element.getAttribute("href") || "";
    return Boolean(href) && !isSameOriginUrl(href);
  }
  return false;
}

function assertDataUrl(dataUrl: string): string {
  if (!isWidgetScreenshotDataUrl(dataUrl)) {
    throw new ScreenshotCaptureError("capture-failed", "Screenshot was empty");
  }
  return dataUrl;
}

async function captureWithHtml(ignore: Element[]): Promise<string> {
  await waitFrames(2);
  const width = Math.max(1, Math.round(window.innerWidth));
  const height = Math.max(1, Math.round(window.innerHeight));
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const bodyBg = window.getComputedStyle(document.body).backgroundColor;
  const backgroundColor =
    !bodyBg || bodyBg === "transparent" || bodyBg === "rgba(0, 0, 0, 0)"
      ? "#ffffff"
      : bodyBg;
  const canvas = await html2canvas(document.documentElement, {
    x: window.scrollX,
    y: window.scrollY,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: -window.scrollX,
    scrollY: -window.scrollY,
    scale,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor,
    ignoreElements: (element) =>
      wouldTaintCanvas(element) ||
      ignore.some((node) => node === element || node.contains(element)),
    onclone: (doc) => {
      doc.querySelectorAll("[data-featul-widget]").forEach((node) => {
        node.parentElement?.removeChild(node);
      });
    },
  });
  return assertDataUrl(jpegDataUrlFromCanvas(canvas));
}

async function captureWithDisplayMedia(
  hideWidget: () => void,
): Promise<string> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new ScreenshotCaptureError("capture-failed");
  }
  const displayOptions = {
    audio: false,
    video: true,
    preferCurrentTab: true,
    selfBrowserSurface: "include",
    surfaceSwitching: "exclude",
    systemAudio: "exclude",
    monitorTypeSurfaces: "exclude",
  } as DisplayMediaStreamOptions;
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia(displayOptions);
  } catch (error) {
    const name =
      error && typeof error === "object" && "name" in error
        ? String(error.name)
        : "";
    if (name === "NotAllowedError" || name === "AbortError") {
      throw new ScreenshotCaptureError("cancelled");
    }
    throw new ScreenshotCaptureError("capture-failed");
  }

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.srcObject = stream;
  try {
    hideWidget();
    await video.play();
    await waitMs(120);
    await waitFrames(2);
    const width = Math.max(1, video.videoWidth);
    const height = Math.max(1, video.videoHeight);
    const canvas = document.createElement("canvas");
    const maxEdge = 1920;
    const fit = Math.min(1, maxEdge / Math.max(width, height));
    canvas.width = Math.round(width * fit);
    canvas.height = Math.round(height * fit);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ScreenshotCaptureError("capture-failed");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return assertDataUrl(jpegDataUrlFromCanvas(canvas));
  } finally {
    for (const track of stream.getTracks()) track.stop();
    video.srcObject = null;
  }
}

export async function captureHostViewport(
  ignore: Element[],
  hideWidget: () => void,
): Promise<string> {
  try {
    hideWidget();
    return await captureWithHtml(ignore);
  } catch {
    /* Modern CSS (oklch) and cross-origin images often break DOM capture. */
  }
  return captureWithDisplayMedia(hideWidget);
}
