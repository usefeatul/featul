import {
  BoardIcon,
  FeedbackIcon,
  LockIcon,
  VoteIcon,
} from "@/components/global/icons";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";

export function PortalPreview({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none relative h-60 overflow-hidden rounded-lg bg-primary/7 px-4 pt-6 sm:px-5",
        className,
      )}
    >
      <div className="mx-auto max-w-sm overflow-hidden rounded-t-xl border border-border bg-card shadow-lg shadow-primary/10">
        <div className="flex items-center justify-center gap-2 border-b border-border bg-card px-3 py-3 text-[11px] text-accent">
          <LockIcon className="size-3" />
          feedback.yourbrand.com
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <BoardIcon className="size-4" />
            Your feedback space
          </div>
          <p className="mt-3 text-base font-semibold tracking-tight text-foreground">
            What should we build next?
          </p>
          <div className="mt-4 divide-y divide-border">
            {[
              "A dark mode for late nights",
              "Keep me in the loop on Slack",
            ].map((idea, index) => (
              <div
                key={idea}
                className="flex items-center gap-3 py-3 first:pt-0"
              >
                <span className="flex w-8 shrink-0 flex-col items-center gap-1 rounded-md border border-border bg-card py-1 text-[10px] text-accent">
                  <VoteIcon className="size-3" />
                  {index === 0 ? "24" : "18"}
                </span>
                <span className="text-xs text-foreground">{idea}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WidgetPreview({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none relative h-60 overflow-hidden rounded-lg bg-primary/7 p-4 sm:p-5",
        className,
      )}
    >
      <div className="absolute inset-x-4 top-6 bottom-0 overflow-hidden rounded-t-xl border border-border/70 bg-card sm:inset-x-5">
        <div className="flex h-10 items-center gap-1.5 border-b border-border/60 px-3">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="size-1.5 rounded-full bg-accent/25" />
          ))}
          <span className="ml-2 text-[10px] text-accent">Your app</span>
        </div>
        <div className="flex h-full">
          <div className="w-14 shrink-0 space-y-3 border-r border-border/60 p-3">
            <div className="h-2 rounded bg-primary/25" />
            <div className="h-2 rounded bg-accent/10" />
            <div className="h-2 rounded bg-accent/10" />
          </div>
          <div className="space-y-3 p-4">
            <div className="h-2 w-24 rounded bg-accent/15" />
            <div className="h-2 w-16 rounded bg-accent/10" />
          </div>
        </div>
      </div>
      <div className="absolute right-4 bottom-4 w-[76%] max-w-64 rounded-xl border border-border bg-card p-4 shadow-lg shadow-black/8 sm:right-5">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <FeedbackIcon className="size-4" />
          Got an idea?
        </div>
        <div className="mt-3 rounded-md border border-border bg-card px-3 py-3 text-[11px] leading-5 text-accent">
          What would make your day easier?
        </div>
        <Button asChild variant="default" size="sm" className="mt-3 w-full">
          <span>Share your idea</span>
        </Button>
      </div>
    </div>
  );
}
