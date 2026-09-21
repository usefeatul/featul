import type { MemberStats } from "@/lib/team"

export function MemberCounters({ stats }: { stats: MemberStats }) {
  return (
    <dl className="grid w-full grid-cols-3 rounded-lg bg-muted/35 px-3 py-4 dark:bg-white/[0.025]">
      {([
        ["Posts", stats.posts],
        ["Comments", stats.comments],
        ["Upvotes", stats.upvotes],
      ] as const).map(([label, value]) => (
        <div key={label} className="min-w-0 px-2 text-center">
          <dt className="text-xs text-accent">{label}</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {Number(value || 0)}
          </dd>
        </div>
      ))}
    </dl>
  )
}
