import type { CommentSurface } from "@/lib/comment/shared";

export const commentBadgeClass =
  "inline-flex h-5 shrink-0 items-center justify-center gap-1 rounded-lg border-0 bg-black/5 px-1.5 text-[11px] font-medium leading-none text-accent dark:bg-secondary";

export const commentComposerBackgroundClass: Record<CommentSurface, string> = {
  workspace: "bg-black/[0.02] dark:bg-white/[0.025]",
  public: "bg-card dark:bg-background",
};
export const commentActionIconClass =
  "border-0 bg-transparent p-0 text-foreground shadow-none hover:bg-transparent hover:text-gray-400 dark:bg-transparent dark:text-foreground dark:hover:bg-transparent dark:hover:text-gray-400";

// Restyle the picker through its public tokens and part selectors; its grid and
// focus behavior stay intact. Its CSS lives in the `epr` layer (see globals.css).
export const emojiSurfaceClass =
  "[--emoji-surface:color-mix(in_oklab,var(--muted)_60%,var(--card))] dark:[--emoji-surface:var(--background)]";

export const emojiPickerClass = [
  "[--epr-font-family:var(--font-sans)] [font-family:inherit]",
  "[--epr-bg-color:var(--emoji-surface)] [--epr-text-color:var(--muted-foreground)] [--epr-highlight-color:var(--primary)]",
  "[--epr-picker-border-color:var(--border)] [--epr-picker-border-radius:var(--radius-lg)]",
  "[--epr-hover-bg-color:var(--muted)] [--epr-hover-bg-color-reduced-opacity:color-mix(in_oklab,var(--muted)_60%,transparent)] [--epr-focus-bg-color:var(--muted)]",
  "[--epr-search-input-bg-color:color-mix(in_oklab,var(--muted)_50%,transparent)] [--epr-search-input-bg-color-active:var(--background)]",
  "[--epr-search-input-text-color:var(--foreground)] [--epr-search-input-placeholder-color:var(--muted-foreground)]",
  "[--epr-search-border-color:color-mix(in_oklab,var(--border)_60%,transparent)] [--epr-search-border-color-active:var(--ring)]",
  "[--epr-search-input-border-radius:var(--radius-lg)] [--epr-search-input-height:32px] [--epr-header-padding:10px_var(--epr-horizontal-padding)]",
  "[--epr-category-icon-active-color:var(--foreground)] [--epr-category-icon-inactive-color:var(--muted-foreground)]",
  "[--epr-category-label-bg-color:var(--emoji-surface)] [--epr-category-label-text-color:var(--muted-foreground)] [--epr-category-label-height:30px]",
  "[--epr-skin-tone-picker-menu-color:var(--emoji-surface)] [--epr-skin-tone-outer-border-color:var(--border)] [--epr-skin-tone-inner-border-color:var(--emoji-surface)]",
  "[--epr-emoji-variation-picker-bg-color:var(--emoji-surface)] [--epr-emoji-size:24px] [--epr-emoji-padding:6px]",
  "border-0 shadow-none",
  "[&_[data-epr-part=search-input]]:text-[13px] [&_[data-epr-part=search-input]]:font-normal",
  "[&_[data-epr-part=search-input]:focus-visible]:shadow-[0_0_0_1px_color-mix(in_oklab,var(--ring)_50%,transparent)]",
  "[&_[data-epr-part=category-label]]:text-[11px] [&_[data-epr-part=category-label]]:font-medium [&_[data-epr-part=category-label]]:normal-case",
  "[&_[data-epr-part=category-nav]]:border-b [&_[data-epr-part=category-nav]]:border-border/50",
  "[&_[data-epr-part=category-tab]]:rounded-lg [&_[data-epr-part=emoji]]:rounded-lg",
  "[&_[data-epr-part=category-tab][aria-selected=true]]:bg-muted",
].join(" ");
