import { cn } from "@oreilla/ui/lib/utils"

type WizardKeyBlocksProps = {
  className?: string
}

const blocks = [
  {
    label: "Collect",
    color: "bg-emerald-500",
  },
  {
    label: "Ship",
    color: "bg-blue-500",
  },
  {
    label: "Announce",
    color: "bg-amber-500",
  },
  {
    label: "Prioritize",
    color: "bg-rose-500",
  },
]

export default function WizardKeyBlocks({ className }: WizardKeyBlocksProps) {
  return (
    <div
      className={cn("hidden md:flex pr-10 max-w-[520px]", className)}
    >
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
              className={`absolute inset-0 ${block.color} opacity-60 rounded-xl translate-x-2 translate-y-2`}
            />
            <div
              className={cn(
                "relative",
                block.color,
                "rounded-2xl px-7 py-8 h-32 flex items-center justify-center",
                "shadow-lg transition-all duration-300",
                "group-hover:-translate-y-1 group-hover:shadow-2xl",
                "border-t-2 border-l-2 border-white/20",
              )}
            >
              <span className="text-white font-bold text-lg tracking-wide uppercase">
                {block.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
