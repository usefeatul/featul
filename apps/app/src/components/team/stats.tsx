import SectionCard from "@/components/settings/global/SectionCard"
import type { MemberStats } from "@/lib/team"

export function MemberOverview({ stats }: { stats: MemberStats }) {
  return (
    <SectionCard title="At a glance" contentClassName="p-0">
      <MemberCounters stats={stats} />
    </SectionCard>
  )
}

export function MemberCounters({ stats }: { stats: MemberStats }) {
  return (
    <dl className="grid w-full grid-cols-3 divide-x divide-border/50">
      {([
        ["Posts", stats.posts],
        ["Comments", stats.comments],
        ["Upvotes", stats.upvotes],
      ] as const).map(([label, value]) => (
        <div key={label} className="flex min-w-0 flex-col gap-1.5 px-2 py-4 text-center">
          <dt className="text-xs font-medium text-accent">{label}</dt>
          <dd className="order-first text-2xl font-semibold tracking-tight tabular-nums text-foreground">
            {Number(value || 0)}
          </dd>
        </div>
      ))}
    </dl>
  )
}
