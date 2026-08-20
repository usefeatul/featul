export const overlayShellClass =
  "overflow-hidden rounded-xl border border-border bg-card text-foreground dark:border-white/10 dark:bg-black"

export const overlayInnerClass =
  "overflow-hidden rounded-lg bg-background ring-1 ring-border/60 ring-offset-1 ring-offset-card dark:ring-white/10 dark:ring-offset-black"

/** Outer chip shell — same two-tone frame as integration cards, `rounded-md`. */
export const overlayChipShellClass =
  "box-border inline-flex shrink-0 items-stretch rounded-md border border-border bg-card p-0.5 text-foreground dark:border-white/10 dark:bg-black"

/** Inner chip surface — `bg-background` on the dark shell. No ring-offset (that doubled the border at this size). */
export const overlayChipInnerClass =
  "inline-flex h-4 min-h-4 min-w-4 flex-1 items-center justify-center overflow-hidden rounded-[4px] bg-background text-xs font-extralight tabular-nums text-accent"

/** Same shell as cards/toolbars, with the card padding so inner `rounded-lg` sits flush. */
export const overlayDialogClass = `${overlayShellClass} p-2`
