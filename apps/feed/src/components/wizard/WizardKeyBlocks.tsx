import { cn } from "@oreilla/ui/lib/utils"

type WizardKeyBlocksProps = {
  className?: string
}

const blocks = [
  {
    label: "Collect",
    color: "bg-emerald-500",
    gradient: "from-emerald-400 to-emerald-600",
  },
  {
    label: "Ship",
    color: "bg-blue-500",
    gradient: "from-sky-400 to-blue-600",
  },
  {
    label: "Announce",
    color: "bg-amber-500",
    gradient: "from-amber-400 to-amber-600",
  },
  {
    label: "Prioritize",
    color: "bg-rose-500",
    gradient: "from-rose-400 to-rose-600",
  },
]

export default function WizardKeyBlocks({ className }: WizardKeyBlocksProps) {
  return (
    <div
      className={cn("hidden md:flex pr-10 max-w-[520px] h-full", className)}
    >
      <div className="flex flex-col justify-between gap-6 w-full h-full pt-6 pb-6">
        <div className="space-y-2 max-w-sm">
          <p className="text-xs font-medium tracking-[0.24em] uppercase text-accent">
            Feedback blocks
          </p>
          <p className="text-sm text-accent max-w-sm">
            A simple stack of steps that guide how you collect, ship, announce and prioritize work.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 w-full">
        {blocks.map((block, index) => (
          <div
            key={block.label}
            className={cn(
              "group relative",
            )}
            style={{
              transform: index % 2 === 0 ? "rotate(-3deg)" : "rotate(3deg)",
            }}
          >
            <div
              className={cn(
                "absolute inset-0 rounded-2xl translate-x-3 translate-y-3 opacity-70",
                block.color,
              )}
            />
            <div
              className={cn(
                "relative",
                "rounded-2xl px-8 py-10 h-40 flex items-center justify-center",
                "shadow-[0_18px_40px_rgba(15,23,42,0.9)] transition-transform duration-300",
                "group-hover:-translate-y-2 group-hover:shadow-[0_24px_55px_rgba(15,23,42,1)]",
                "border border-white/12 bg-gradient-to-br",
                block.gradient,
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <span className="text-white font-semibold text-lg tracking-[0.22em] uppercase">
                  {block.label}
                </span>
                <span className="h-1 w-10 rounded-full bg-white/80" />
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}
