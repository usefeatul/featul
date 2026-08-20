/** Outer widget radius matches the host iframe (12px). Inner is 12px − 4px padding. */
export const widgetCardShellClass =
  "flex flex-col overflow-hidden rounded-[12px] border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-shell))] p-1 text-[rgb(var(--widget-fg))]";

export const widgetCardInnerClass =
  "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] bg-[rgb(var(--widget-surface))] ring-1 ring-[rgb(var(--widget-fg)/0.1)]";

export const widgetToolbarShellClass =
  "flex items-stretch overflow-hidden rounded-[10px] border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-shell))] p-0.5";

export const widgetToolbarInnerClass =
  "flex min-h-8 flex-1 items-stretch overflow-hidden rounded-[6px] bg-[rgb(var(--widget-surface))] ring-1 ring-[rgb(var(--widget-fg)/0.1)]";

export const widgetToolbarItemClass =
  "h-full rounded-none border-none bg-transparent shadow-none ring-0 hover:bg-[rgb(var(--widget-fg)/0.06)]";
