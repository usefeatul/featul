"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@oreilla/ui/components/card"
import { Label } from "@oreilla/ui/components/label"
import { Input } from "@oreilla/ui/components/input"
import StatusBadge from "@/components/tools/global/status-badge"

export default function FeatureUsageFrequency() {
  const [activeUsers, setActiveUsers] = useState<number>(800)
  const [totalUses, setTotalUses] = useState<number>(2300)
  const [periodLabel, setPeriodLabel] = useState<string>("last 30 days")

  const metrics = useMemo(() => {
    const users = isFinite(activeUsers) ? activeUsers : 0
    const uses = isFinite(totalUses) ? totalUses : 0
    const avg = users > 0 ? uses / users : 0
    const status = avg >= 3 ? "Strong" : avg >= 1 ? "Moderate" : "Low"
    return { avg, status }
  }, [activeUsers, totalUses])

  const fmt = (n: number) => n.toFixed(2)

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Feature usage frequency</h2>
        <p>
          Estimate average repeats per active user for a feature over a period. This helps gauge depth of value beyond
          first‑time adoption.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card >
          <CardHeader className="tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter active users and total feature uses in the period.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="activeUsers">Active users (feature)</Label>
                <Input
                  id="activeUsers"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={isFinite(activeUsers) ? activeUsers : 0}
                  onChange={(e) => setActiveUsers(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="totalUses">Total uses</Label>
                <Input
                  id="totalUses"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={isFinite(totalUses) ? totalUses : 0}
                  onChange={(e) => setTotalUses(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="period">Period label</Label>
                <Input
                  id="period"
                  type="text"
                  value={periodLabel}
                  onChange={(e) => setPeriodLabel(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-sm text-accent">
              Avg uses/user <span className="font-mono ml-1 text-foreground">{fmt(metrics.avg)}</span>
            </div>
            <StatusBadge status={metrics.status as "Low" | "Moderate" | "Strong"} />
          </CardFooter>
        </Card>

        <Card >
          <CardHeader className="tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Engagement depth indicators.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md  border p-3 text-center">
                <div className="text-xs text-accent">Avg uses/user</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{fmt(metrics.avg)}</div>
              </div>
              <div className="rounded-md  border p-3 text-center">
                <div className="text-xs text-accent">Status</div>
                <div className="mt-1 text-base leading-tight">{metrics.status}</div>
              </div>
              <div className="rounded-md  border p-3 text-center">
                <div className="text-xs text-accent">Active users</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{isFinite(activeUsers) ? activeUsers.toLocaleString() : 0}</div>
              </div>
              <div className="rounded-md  border p-3 text-center">
                <div className="text-xs text-accent">Total uses</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{isFinite(totalUses) ? totalUses.toLocaleString() : 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>Interpreting frequency</h3>
        <p>
          Frequency complements adoption by showing depth of use. Averages near or above three uses per user in a month
          indicate repeated value. Investigate distribution (how many users are heavy vs. light) for fuller insight.
        </p>
        <h4>Ways to improve</h4>
        <ul>
          <li>Reduce effort and clicks for repeat workflows.</li>
          <li>Make high‑value actions easy to rediscover and complete.</li>
          <li>Bundle adjacent steps into one cohesive flow.</li>
        </ul>
      </section>
    </div>
  )
}
