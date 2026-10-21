import { ArrowRight } from "lucide-react"
import { Button } from "@featul/ui/components/button"
import { DitherGradient } from "@featul/ui/components/gradient"
import { modalCardInnerClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"
import { LIVE_DEMO_URL } from "@/config/auth"
import { docsSectionClass, docsSurfaceHeaderClass } from "./surface"

/** Sends an unanswered question to Featul's own feedback board. */
export function DocsAskButton({ className }: { className?: string }) {
  return (
    <Button asChild className={cn("gap-2 pl-3.5 pr-1.5", className)}>
      <a href={LIVE_DEMO_URL} target="_blank" rel="noopener noreferrer">
        Ask on the board
        <span className="flex size-6 items-center justify-center rounded-md bg-primary-foreground/15">
          <ArrowRight aria-hidden className="size-3.5" strokeWidth={1.5} />
        </span>
      </a>
    </Button>
  )
}

/** Right-rail card on docs pages, the help article's "Still stuck?". */
export function DocsStillStuck() {
  return (
    <div className={docsSectionClass}>
      <header className={docsSurfaceHeaderClass}>
        <h2 className="text-sm font-medium leading-6 text-foreground">Still stuck?</h2>
      </header>
      <div className={cn(modalCardInnerClass, "relative isolate px-4 py-3")}>
        {/* Same corner dither as the help center's "Still stuck?" card. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{ maskImage: "radial-gradient(ellipse 60% 55% at 100% 0%, black 0%, rgba(0,0,0,0.35) 45%, transparent 75%)" }}
        >
          <DitherGradient to="primary" direction="down" cell={3} opacity={0.35} />
        </div>
        <p className="text-[13px] leading-5 text-muted-foreground">
          Post it on the board. The team answers there.
        </p>
        <DocsAskButton className="mt-3 h-8 w-full justify-between text-[13px]" />
      </div>
    </div>
  )
}
