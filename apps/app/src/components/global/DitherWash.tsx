import { DitherGradient } from "@featul/ui/components/gradient"
import { cn } from "@featul/ui/lib/utils"

/**
 * Faint dither wash across the top of a dialog surface, fading out within a few rows.
 * Needs a `relative isolate` ancestor (usually the dialog's inner surface).
 */
export function DitherWash({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 top-0 -z-10 h-32", className)}
      style={{
        maskImage:
          "radial-gradient(ellipse 70% 100% at 50% 0%, black 0%, rgba(0,0,0,0.35) 50%, transparent 100%)",
      }}
    >
      <DitherGradient to="primary" direction="down" cell={3} opacity={0.2} />
    </div>
  )
}
