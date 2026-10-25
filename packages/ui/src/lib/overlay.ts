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

/** Modal shell (dialog, alert dialog, sheet): menu-surface depth on the nested `p-1` frame. */
export const modalShellClass =
  "overflow-hidden rounded-xl border border-black/[0.08] bg-sidebar bg-linear-to-b from-sidebar to-[color-mix(in_oklab,var(--sidebar),var(--foreground)_3%)] p-1 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-8px_rgba(0,0,0,0.14)] dark:border-white/[0.08] dark:from-[color-mix(in_oklab,var(--sidebar),white_2%)] dark:to-sidebar dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.35),0_1px_2px_rgba(0,0,0,0.4),0_10px_24px_-8px_rgba(0,0,0,0.55)]"

/** Modal content surface inside `modalShellClass`. */
export const modalInnerClass =
  "overflow-hidden rounded-lg bg-card ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:bg-linear-to-b dark:from-[color-mix(in_oklab,var(--card),white_3%)] dark:to-card dark:ring-white/[0.07] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.4)]"

/** Card frame with the modal's design (gradient `p-1` shell, lit edge) and only a hairline drop shadow. */
export const modalCardShellClass =
  "overflow-hidden rounded-2xl [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*4)] border border-black/[0.08] bg-sidebar bg-linear-to-b from-sidebar to-[color-mix(in_oklab,var(--sidebar),var(--foreground)_3%)] p-1 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.04),0_1px_1px_rgba(0,0,0,0.03)] dark:border-white/[0.08] dark:from-[color-mix(in_oklab,var(--sidebar),white_2%)] dark:to-sidebar dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.35),0_1px_1px_rgba(0,0,0,0.12)]"

/** Card content surface inside `modalCardShellClass`; matches `modalInnerClass` without a drop shadow. */
export const modalCardInnerClass =
  "overflow-hidden rounded-xl [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*3.5)] bg-card ring-1 ring-black/[0.06] dark:bg-linear-to-b dark:from-[color-mix(in_oklab,var(--card),white_3%)] dark:to-card dark:ring-white/[0.07] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"

/** Image thumbnail frame: lit edge and gradient around a `p-1` inset, no drop shadow. */
export const imageShellClass =
  "overflow-hidden rounded-xl [corner-shape:squircle] border border-black/[0.08] bg-linear-to-b from-card to-[color-mix(in_oklab,var(--card),var(--foreground)_5%)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,1)] dark:border-white/[0.08] dark:from-[color-mix(in_oklab,var(--card),white_5%)] dark:to-card dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"

/** Picture clip inside `imageShellClass`; the shell carries the only border. */
export const imageInnerClass =
  "relative overflow-hidden rounded-[0.5rem] [corner-shape:squircle] bg-card dark:bg-background"

/** Board/list card: menu-surface depth with only a tight shadow. */
export const raisedCardClass =
  "rounded-xl [corner-shape:squircle] border border-black/[0.08] bg-card bg-linear-to-b from-card to-[color-mix(in_oklab,var(--card),var(--foreground)_3%)] shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:from-[color-mix(in_oklab,var(--card),white_4%)] dark:to-card dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.35),0_1px_2px_rgba(0,0,0,0.4)]"

/** Selector surface (select triggers, picker buttons, segmented pill): the raised control with the faintest drop shadow. */
export const selectorSurfaceClass =
  "border border-black/[0.1] bg-card bg-linear-to-b from-card to-[color-mix(in_oklab,var(--card),var(--foreground)_7%)] shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.05),0_1px_1px_rgba(0,0,0,0.03)] [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*1.5)] dark:border-white/[0.08] dark:from-[color-mix(in_oklab,var(--card),white_5%)] dark:to-card dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_1px_rgba(0,0,0,0.12)]"

/** Small raised control (badges, count chips, search field, kbd): gradient, lit top edge, hairline shadow. */
export const raisedSurfaceClass =
  "border border-black/[0.1] bg-card bg-linear-to-b from-card to-[color-mix(in_oklab,var(--card),var(--foreground)_7%)] shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.07)] [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*1.5)] dark:border-white/[0.08] dark:from-[color-mix(in_oklab,var(--card),white_5%)] dark:to-card dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_1px_rgba(0,0,0,0.3)]"

/** Text fields (inputs, textareas, search): the raised surface with only the faintest drop shadow. */
export const inputSurfaceClass =
  "border border-black/[0.1] bg-card bg-linear-to-b from-card to-[color-mix(in_oklab,var(--card),var(--foreground)_7%)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1px_1px_rgba(0,0,0,0.03)] [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*1.5)] dark:border-white/[0.08] dark:from-[color-mix(in_oklab,var(--card),white_5%)] dark:to-card dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_1px_rgba(0,0,0,0.12)]"

/** Outer chip shell — a compact version of the shared subtle frame. */
export const overlayChipShellClass =
  "box-border inline-flex shrink-0 items-stretch rounded-md border border-border/60 bg-card p-0.5 text-foreground dark:border-white/[0.07]"

/** Inner chip surface — `bg-background` on the dark shell. No ring-offset (that doubled the border at this size). */
export const overlayChipInnerClass =
  "inline-flex h-4 min-h-4 min-w-4 flex-1 items-center justify-center overflow-hidden rounded-[4px] bg-background text-xs font-extralight tabular-nums text-accent"

/**
 * Avatar frame: the picture fills the whole shape and a hairline outline and lit top edge are
 * drawn over its edge, with the faintest drop shadow. In dark mode the outline sits just outside
 * the picture instead, where it shows against the dark page. The radius is a percentage (the app
 * pins `rounded-full` to the standard radius) so every avatar size is equally round.
 */
export const overlayAvatarShellClass =
  "relative inline-flex shrink-0 overflow-visible rounded-[40%] bg-linear-to-b from-card to-[color-mix(in_oklab,var(--card),var(--foreground)_6%)] shadow-[0_1px_1px_rgba(0,0,0,0.03)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.25)] dark:from-[color-mix(in_oklab,var(--card),white_6%)] dark:to-card dark:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_1px_1px_rgba(0,0,0,0.12)] dark:after:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"

export const overlayAvatarInnerClass =
  "size-full overflow-hidden rounded-[inherit] bg-transparent"

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
