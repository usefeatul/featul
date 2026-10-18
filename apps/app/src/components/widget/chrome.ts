/** Single-layer widget surface; the host iframe supplies the radius, ring, and shadow. */
export const widgetCardShellClass =
  "flex flex-col overflow-hidden bg-[rgb(var(--widget-surface))] text-[rgb(var(--widget-fg))]";

export const widgetToolbarShellClass =
  "flex items-stretch overflow-hidden rounded-lg border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-shell))] p-0.5";

export const widgetToolbarInnerClass =
  "flex min-h-8 flex-1 items-stretch overflow-hidden rounded-lg bg-[rgb(var(--widget-surface))] ring-1 ring-[rgb(var(--widget-fg)/0.1)]";

export const widgetToolbarItemClass =
  "h-full rounded-none border-none bg-transparent shadow-none ring-0 hover:bg-[rgb(var(--widget-fg)/0.06)]";

export const widgetToolbarSeparatorClass =
  "w-px shrink-0 self-stretch bg-[rgb(var(--widget-fg)/0.1)]";

export const widgetChipShellClass =
  "box-border inline-flex shrink-0 items-stretch rounded-lg border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-shell))] p-0.5";

export const widgetChipInnerClass =
  "inline-flex h-4 min-h-4 min-w-4 flex-1 items-center justify-center overflow-hidden rounded-lg bg-[rgb(var(--widget-surface))]";

/** Two-tone image frame — same shell/inner language as create-post ContentImage. */
export const widgetImageShellClass =
  "relative overflow-hidden rounded-lg border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-shell))] p-0.5";

export const widgetImageInnerClass =
  "overflow-hidden rounded-lg bg-[rgb(var(--widget-surface))] ring-1 ring-[rgb(var(--widget-fg)/0.1)]";
