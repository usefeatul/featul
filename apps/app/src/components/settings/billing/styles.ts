// `rounded-full` is capped to the app radius, so the pill uses an explicit one.
export const usageTrackClass =
  "h-2.5 overflow-hidden rounded-[999px] bg-muted shadow-[inset_0_1px_2px_rgb(0_0_0/0.06)]";

// Dotted fill with a brighter dot layer that sweeps across once on mount.
export const usageFillClass = [
  "relative h-full overflow-hidden rounded-[inherit]",
  "bg-[radial-gradient(rgb(255_255_255/0.36)_0.7px,transparent_0.8px)] bg-size-[4px_4px]",
  "after:absolute after:inset-0 after:content-[''] after:animate-sweep",
  "after:bg-[radial-gradient(rgb(255_255_255/0.85)_0.8px,transparent_0.9px)] after:bg-size-[4px_4px]",
  "after:mask-[linear-gradient(90deg,transparent_10%,black_50%,transparent_90%)]",
  "motion-reduce:after:animate-none motion-reduce:after:opacity-0",
].join(" ");

// Overrides the shared modal shell (both themes) with a taller, softer surface and
// an inner highlight ring drawn by ::after.
export const plansDialogSurfaceClass = [
  "rounded-[1rem] border-border/80 dark:border-border/80 supports-[corner-shape:squircle]:rounded-[1.5rem]",
  "from-background to-[color-mix(in_oklab,var(--background),var(--muted)_25%)] dark:from-[color-mix(in_oklab,var(--background),var(--muted)_30%)] dark:to-background",
  "shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.06),0_24px_80px_-24px_rgb(0_0_0/0.35)]",
  "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_1px_2px_rgb(0_0_0/0.4),0_24px_80px_-24px_rgb(0_0_0/0.5)]",
  "after:pointer-events-none after:absolute after:inset-px after:z-1 after:rounded-[inherit] after:content-[''] supports-[corner-shape:squircle]:after:[corner-shape:squircle]",
  "after:shadow-[inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-1px_0_rgb(0_0_0/0.04)] dark:after:shadow-[inset_0_1px_0_rgb(255_255_255/0.04),inset_0_-1px_0_rgb(0_0_0/0.2)]",
  "[&>[data-slot=dialog-close]]:top-5 [&>[data-slot=dialog-close]]:right-5",
].join(" ");

export const planCardClass =
  "relative isolate flex flex-col overflow-hidden rounded-[0.75rem] border border-border/65 bg-sidebar p-4 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground),transparent_97%)]";

export const planPatternClass =
  "opacity-65 mask-[linear-gradient(to_bottom,black_0%,black_40%,transparent_100%)] dark:opacity-90";

// Cell padding lives on the table so every row lines up with the plan cards above.
export const planComparisonTableClass = [
  "w-full min-w-[28rem] table-fixed border-collapse text-xs",
  "[&_:is(th,td)]:px-2 [&_:is(th,td)]:py-3 [&_thead_th]:pt-0 [&_thead_th]:pb-4",
  "[&_tr>:first-child]:pl-7 [&_tr>:last-child]:pr-7 [&_tbody_tr:last-child>*]:pb-0",
  "[&_tbody_tr]:border-t [&_tbody_tr]:border-border/60",
  "max-sm:min-w-0 max-sm:text-[0.625rem] max-sm:[&_:is(th,td)]:px-1 max-sm:[&_:is(th,td)]:wrap-anywhere",
  "max-sm:[&_tr>:first-child]:pl-5 max-sm:[&_tr>:last-child]:pr-5",
].join(" ");
