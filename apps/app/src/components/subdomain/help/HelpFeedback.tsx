"use client";

import React from "react";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import { cn } from "@featul/ui/lib/utils";
import { DislikeIcon, LikeIcon } from "@/components/global/icons";

const storageKey = (articleId: string) => `featul_help_vote_${articleId}`;
const viewedKey = (articleId: string) => `featul_help_viewed_${articleId}`;

/** "Was this helpful?" with one remembered vote per browser; also counts one view per session. */
export function HelpFeedback({ slug, articleId }: { slug: string; articleId: string }) {
  const [vote, setVote] = React.useState<boolean | null>(null);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(storageKey(articleId));
    if (stored === "yes" || stored === "no") setVote(stored === "yes");
    if (!window.sessionStorage.getItem(viewedKey(articleId))) {
      window.sessionStorage.setItem(viewedKey(articleId), "1");
      void client.help.view.$post({ slug, articleId }).catch(() => {});
    }
  }, [slug, articleId]);

  const choose = async (helpful: boolean) => {
    if (pending || vote === helpful) return;
    const previous = vote;
    setVote(helpful);
    setPending(true);
    try {
      const res = await client.help.feedback.$post({
        slug,
        articleId,
        helpful,
        previous: previous ?? undefined,
      });
      if (!res.ok) throw new Error();
      window.localStorage.setItem(storageKey(articleId), helpful ? "yes" : "no");
      toast.success(helpful ? "Thanks for letting us know." : "Thanks. We'll work on this article.");
    } catch {
      setVote(previous);
      toast.error("Couldn't save your feedback. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border/60 py-4 dark:border-white/[0.07]">
      <p className="text-sm font-medium text-foreground">Was this helpful?</p>
      <div className="flex items-center gap-2">
        {([true, false] as const).map((helpful) => {
          const selected = vote === helpful;
          const Icon = helpful ? LikeIcon : DislikeIcon;
          return (
            <button
              key={String(helpful)}
              type="button"
              aria-pressed={selected}
              disabled={pending}
              onClick={() => choose(helpful)}
              className={cn(
                "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border px-4 text-sm font-medium sm:h-8 sm:px-3 transition-colors disabled:cursor-default",
                selected
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground dark:border-white/10 dark:hover:bg-white/5",
              )}
            >
              <Icon className="size-4" />
              {helpful ? "Yes" : "No"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
