export function escapeId(id: string): string {
  try {
    return CSS?.escape ? CSS.escape(id) : id;
  } catch {
    return id;
  }
}
export function supportsSmoothScroll(): boolean {
  return (
    typeof CSS !== "undefined" &&
    CSS.supports &&
    CSS.supports("scroll-behavior: smooth")
  );
}
export function getScrollTargetY(el: HTMLElement): number {
  const marginTopRaw = getComputedStyle(el).scrollMarginTop;
  const marginTop = parseFloat(marginTopRaw || "0") || 0;
  return el.getBoundingClientRect().top + window.pageYOffset - marginTop;
}

function getElementScrollTargetY(container: HTMLElement, el: HTMLElement): number {
  const marginTopRaw = getComputedStyle(el).scrollMarginTop;
  const marginTop = parseFloat(marginTopRaw || "0") || 0;
  const containerRect = container.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const offsetInContainer = elRect.top - containerRect.top;
  return offsetInContainer + container.scrollTop - marginTop;
}

export function smoothScrollTo(
  targetY: number,
  prefersReducedMotion: boolean
): void {
  if (prefersReducedMotion) {
    window.scrollTo({ top: targetY, behavior: "auto" });
    return;
  }
  if (supportsSmoothScroll()) {
    window.scrollTo({ top: targetY, behavior: "smooth" });
    return;
  }
  const startY = window.scrollY;
  const distance = Math.max(0, targetY - startY);
  const duration = Math.min(600, Math.max(250, distance * 0.5));
  const startTime = performance.now();
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const step = (now: number) => {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    const eased = easeOutCubic(t);
    const nextY = startY + (targetY - startY) * eased;
    window.scrollTo(0, nextY);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function smoothScrollElementTo(
  el: HTMLElement,
  targetY: number,
  prefersReducedMotion: boolean
): void {
  if (prefersReducedMotion) {
    el.scrollTo({ top: targetY, behavior: "auto" });
    return;
  }
  if (supportsSmoothScroll()) {
    el.scrollTo({ top: targetY, behavior: "smooth" });
    return;
  }
  const startY = el.scrollTop;
  const distance = Math.max(0, targetY - startY);
  const duration = Math.min(600, Math.max(250, distance * 0.5));
  const startTime = performance.now();
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const step = (now: number) => {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    const eased = easeOutCubic(t);
    const nextY = startY + (targetY - startY) * eased;
    el.scrollTo(0, nextY);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function scrollToHeading(
  id: string,
  prefersReducedMotion: boolean
): void {
  const el = document.getElementById(id);
  if (!el) return;
  const y = getScrollTargetY(el);
  smoothScrollTo(y, prefersReducedMotion);
}

export function scrollToHeadingInContainer(
  id: string,
  prefersReducedMotion: boolean,
  containerSelector: string
): void {
  const container = document.querySelector<HTMLElement>(containerSelector);
  const el = document.getElementById(id);
  if (!container || !el) return;
  const y = getElementScrollTargetY(container, el);
  smoothScrollElementTo(container, y, prefersReducedMotion);
}

export function updateUrlHash(id: string): void {
  if (history && history.replaceState) {
    history.replaceState(null, "", `#${id}`);
  } else {
    window.location.hash = id;
  }
}
