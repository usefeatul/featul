/** Raised menu surface (popover, dropdown, select): soft gradient, lit top edge, short drop shadow. */
export const subtleOverlayShellClass =
  "overflow-hidden rounded-[0.875rem] [corner-shape:squircle] border border-black/[0.08] bg-popover bg-linear-to-b from-popover to-[color-mix(in_oklab,var(--popover),var(--foreground)_4%)] text-popover-foreground shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06),0_4px_10px_-4px_rgba(0,0,0,0.1)] dark:border-white/[0.08] dark:from-[color-mix(in_oklab,var(--popover),white_4%)] dark:to-popover dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.35),0_1px_2px_rgba(0,0,0,0.4),0_6px_14px_-6px_rgba(0,0,0,0.5)]"

export const subtleOverlayInnerClass =
  "overflow-hidden rounded-[inherit] bg-transparent"

/** Highlighted row inside a menu surface; concentric with the shell across `p-1`. */
export const menuItemClass =
  "rounded-[0.625rem] [corner-shape:squircle] transition-colors duration-75 focus:bg-foreground/[0.05] focus:text-foreground data-[state=open]:bg-foreground/[0.05] dark:focus:bg-foreground/[0.07] dark:focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:data-[state=open]:bg-foreground/[0.07]"

export const overlayShellClass =
  "overflow-hidden rounded-xl border border-border/60 bg-sidebar text-foreground dark:border-white/[0.07]"

export const overlayInnerClass =
  "overflow-hidden rounded-lg bg-card ring-1 ring-border/35 dark:bg-background dark:ring-white/[0.055]"

/** Inner dialog surface with a restrained edge inside the `rounded-xl` shell. */
export const overlayDialogInnerClass =
  "overflow-hidden rounded-lg bg-card ring-1 ring-border/35 dark:bg-background dark:ring-white/[0.055]"

/** Outer chip shell — a compact version of the shared subtle frame. */
export const overlayChipShellClass =
  "box-border inline-flex shrink-0 items-stretch rounded-md border border-border/60 bg-card p-0.5 text-foreground dark:border-white/[0.07]"

/** Inner chip surface — `bg-background` on the dark shell. No ring-offset (that doubled the border at this size). */
export const overlayChipInnerClass =
  "inline-flex h-4 min-h-4 min-w-4 flex-1 items-center justify-center overflow-hidden rounded-[4px] bg-background text-xs font-extralight tabular-nums text-accent"

/** Circular avatar frame — nested ring on the photo, no inset padding. */
export const overlayAvatarShellClass =
  "relative inline-flex shrink-0 overflow-visible rounded-full border border-border/60 bg-card after:pointer-events-none after:absolute after:inset-px after:rounded-full after:ring-1 after:ring-border/35 after:ring-inset dark:border-white/[0.07] dark:after:ring-white/[0.055]"

export const overlayAvatarInnerClass =
  "size-full overflow-hidden rounded-full bg-muted"

/** Rotated corner ribbon — nested chip on a 45° square. */
export const overlayRibbonShellClass =
  `${overlayChipShellClass} pointer-events-none absolute -top-[19px] -right-[19px] z-10 h-[38px] w-[38px] rotate-45 rounded-[4px] p-0.5`

export const overlayRibbonInnerClass =
  "flex h-full w-full flex-1 items-end justify-center overflow-hidden rounded-[2px] pb-1 text-white"

/** Same nested frame as settings/integration cards: `rounded-xl` shell, `p-2`, inner `rounded-lg`. */
export const overlayDialogClass = `${overlayShellClass} p-1`

/** Squircle corners for floating panels (dialogs, popovers, editor menus) — matches the button corner shape. */
export const overlayRoundedClass =
  "rounded-2xl [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*4)]"

/** Inner surface corners that stay concentric with `overlayRoundedClass` across the `p-1` inset. */
export const overlayRoundedInnerClass =
  "rounded-xl [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*3.5)]"
