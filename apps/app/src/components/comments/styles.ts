import type { CommentSurface } from "@/lib/comment/shared";

export const commentBadgeClass =
  "inline-flex h-5 shrink-0 items-center justify-center gap-1 rounded-md border-0 bg-black/5 px-1.5 text-[11px] font-medium leading-none text-accent dark:bg-[#292929]";

export const commentComposerBackgroundClass: Record<CommentSurface, string> = {
  workspace: "bg-black/[0.02] dark:bg-white/[0.025]",
  public: "bg-muted/60 dark:bg-background",
};
