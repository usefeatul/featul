import html2canvas from "html2canvas";

export const SCREENSHOT_MAX_BYTES = 1.5 * 1024 * 1024;
const JPEG_QUALITIES = [0.82, 0.7, 0.55, 0.42];

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
  return canvas.toDataURL("image/jpeg", JPEG_QUALITIES[JPEG_QUALITIES.length - 1]);
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

export async function captureHostViewport(ignore: Element[]): Promise<string> {
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
      ignore.some((node) => node === element || node.contains(element)),
    onclone: (doc) => {
      doc.querySelectorAll("[data-featul-widget]").forEach((node) => {
        node.parentElement?.removeChild(node);
      });
    },
  });
  const dataUrl = jpegDataUrlFromCanvas(canvas);
  if (!isWidgetScreenshotDataUrl(dataUrl)) {
    throw new Error("Screenshot was empty");
  }
  return dataUrl;
}
