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

export function scrollToHeading(
  id: string,
  prefersReducedMotion: boolean
): void {
  const el = document.getElementById(id);
  if (!el) return;
  const y = getScrollTargetY(el);
  smoothScrollTo(y, prefersReducedMotion);
}

export function updateUrlHash(id: string): void {
  if (history && history.replaceState) {
    history.replaceState(null, "", `#${id}`);
  } else {
    window.location.hash = id;
  }
}
