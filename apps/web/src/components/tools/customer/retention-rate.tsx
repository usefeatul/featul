"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@feedgot/ui/components/card"
import { Label } from "@feedgot/ui/components/label"
import { Input } from "@feedgot/ui/components/input"

export default function RetentionRateTool() {
  const [startCustomers, setStartCustomers] = useState<string>("300")
  const [endCustomers, setEndCustomers] = useState<string>("288")

  const metrics = useMemo(() => {
    const s = Number(startCustomers)
    const e = Number(endCustomers)
    const retention = Number.isFinite(s) && s > 0 && Number.isFinite(e) ? (e / s) * 100 : 0
    const churn = 100 - retention
    return { retention, churn }
  }, [startCustomers, endCustomers])

  const formatPct = (n: number) => `${n.toFixed(1)}%`

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Retention Rate</h2>
        <p>
          Retention measures the percentage of customers who remain active from the start to the end of a period.
          Formula: <code>Retention = Customers at end ÷ Customers at start × 100%</code>.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter customers at the start and end of the period.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="start">Customers at start</Label>
                <Input id="start" type="text" value={startCustomers} onChange={(e) => setStartCustomers(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end">Customers at end</Label>
                <Input id="end" type="text" value={endCustomers} onChange={(e) => setEndCustomers(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="retention">Retention rate</Label>
                <Input id="retention" type="text" value={formatPct(metrics.retention)} readOnly />
              </div>
              <div className="space-y-1">
                <Label htmlFor="churn">Churn rate</Label>
                <Input id="churn" type="text" value={formatPct(metrics.churn)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Retention and churn for the cohort.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Retention</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatPct(metrics.retention)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Churn</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatPct(metrics.churn)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>Notes</h3>
        <ul>
          <li>Exclude new acquisitions when computing retention for existing cohorts.</li>
          <li>Complement with revenue retention for a full picture.</li>
        </ul>
      </section>
    </div>
  )
}