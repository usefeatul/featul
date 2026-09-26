type PanelRect = { left: number; top: number; width: number; height: number };

/** Resize the layout once, then visually glide from its previous on-screen bounds. */
export function animatePanelResize(
  element: HTMLElement,
  previous: PanelRect,
  next: PanelRect,
  reduceMotion: boolean,
): Animation | null {
  if (
    reduceMotion ||
    typeof element.animate !== "function" ||
    previous.width <= 0 || previous.height <= 0 ||
    next.width <= 0 || next.height <= 0 ||
    (previous.left === next.left && previous.top === next.top &&
      previous.width === next.width && previous.height === next.height)
  ) return null;

  return element.animate([
    {
      transformOrigin: "0 0",
      transform: `translate(${previous.left - next.left}px, ${previous.top - next.top}px) scale(${previous.width / next.width}, ${previous.height / next.height})`,
    },
    { transformOrigin: "0 0", transform: "none" },
  ], {
    duration: 420,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  });
}
