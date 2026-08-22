export const overlayShellClass =
  "overflow-hidden rounded-xl border border-border bg-card text-foreground dark:border-white/10 dark:bg-black"

export const overlayInnerClass =
  "overflow-hidden rounded-lg bg-background ring-1 ring-border/60 ring-offset-1 ring-offset-card dark:ring-white/10 dark:ring-offset-black"

/** Inner dialog surface — `rounded-2xl` to sit inside the `rounded-3xl` shell. */
export const overlayDialogInnerClass =
  "overflow-hidden rounded-2xl bg-background ring-1 ring-border/60 ring-offset-1 ring-offset-card dark:ring-white/10 dark:ring-offset-black"

/** Outer chip shell — same two-tone frame as integration cards, `rounded-md`. */
export const overlayChipShellClass =
  "box-border inline-flex shrink-0 items-stretch rounded-md border border-border bg-card p-0.5 text-foreground dark:border-white/10 dark:bg-black"

/** Inner chip surface — `bg-background` on the dark shell. No ring-offset (that doubled the border at this size). */
export const overlayChipInnerClass =
  "inline-flex h-4 min-h-4 min-w-4 flex-1 items-center justify-center overflow-hidden rounded-[4px] bg-background text-xs font-extralight tabular-nums text-accent"

/** Circular avatar frame — nested ring on the photo, no inset padding. */
export const overlayAvatarShellClass =
  "relative inline-flex shrink-0 overflow-visible rounded-full border border-border bg-card after:pointer-events-none after:absolute after:inset-px after:rounded-full after:ring-1 after:ring-border/60 after:ring-inset dark:border-white/10 dark:bg-black"

export const overlayAvatarInnerClass =
  "size-full overflow-hidden rounded-full bg-muted"

/** Rotated corner ribbon — nested chip on a 45° square. */
export const overlayRibbonShellClass =
  `${overlayChipShellClass} pointer-events-none absolute -top-[19px] -right-[19px] z-10 h-[38px] w-[38px] rotate-45 rounded-[4px] p-0.5`

export const overlayRibbonInnerClass =
  "flex h-full w-full flex-1 items-end justify-center overflow-hidden rounded-[2px] pb-1 text-white"

/** Same nested frame as settings/integration cards: `rounded-xl` shell, `p-2`, inner `rounded-lg`. */
export const overlayDialogClass = `${overlayShellClass} p-2`
