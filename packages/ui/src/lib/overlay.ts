export const overlayShellClass =
  "overflow-hidden rounded-xl border border-border bg-card text-foreground dark:border-white/10 dark:bg-black"

export const overlayInnerClass =
  "overflow-hidden rounded-lg bg-background ring-1 ring-border/60 ring-offset-1 ring-offset-card dark:ring-white/10 dark:ring-offset-black"

/** Same shell as cards/toolbars, with the card padding so inner `rounded-lg` sits flush. */
export const overlayDialogClass = `${overlayShellClass} p-2`
