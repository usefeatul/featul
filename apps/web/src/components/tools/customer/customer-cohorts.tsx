"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@oreilla/ui/components/card"
import { Label } from "@oreilla/ui/components/label"
import { Input } from "@oreilla/ui/components/input"

type CohortInput = {
  name: string
  size: string
  month1RetentionPct: string
  month3RetentionPct: string
}

export default function CustomerCohortsTool() {
  const [cohorts, setCohorts] = useState<CohortInput[]>([
    { name: "Jan cohort", size: "200", month1RetentionPct: "85", month3RetentionPct: "70" },
    { name: "Feb cohort", size: "180", month1RetentionPct: "82", month3RetentionPct: "66" },
  ])

  const metrics = useMemo(() => {
    const rows = cohorts.map((c) => {
      const size = Number(c.size)
      const m1 = Math.max(0, Math.min(100, Number(c.month1RetentionPct))) / 100
      const m3 = Math.max(0, Math.min(100, Number(c.month3RetentionPct))) / 100
      const retainedM1 = Number.isFinite(size) ? Math.round(size * m1) : 0
      const retainedM3 = Number.isFinite(size) ? Math.round(size * m3) : 0
      return { name: c.name, size, m1Pct: m1 * 100, m3Pct: m3 * 100, retainedM1, retainedM3 }
    })
    return rows
  }, [cohorts])

  const formatPct = (n: number) => `${n.toFixed(1)}%`

  const updateCohort = (idx: number, patch: Partial<CohortInput>) => {
    setCohorts((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)))
  }

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Customer Cohorts</h2>
        <p>
          Track retention by signup cohort to understand how engagement changes over time. Enter sizes and retention
          percentages for key months to compare cohorts.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter cohort size and retention for month 1 and month 3.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cohorts.map((c, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
                  <div className="space-y-1">
                    <Label htmlFor={`name-${i}`}>Name</Label>
                    <Input id={`name-${i}`} type="text" value={c.name} onChange={(e) => updateCohort(i, { name: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`size-${i}`}>Cohort size</Label>
                    <Input id={`size-${i}`} type="text" value={c.size} onChange={(e) => updateCohort(i, { size: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`m1-${i}`}>Month 1 retention %</Label>
                    <Input id={`m1-${i}`} type="text" value={c.month1RetentionPct} onChange={(e) => updateCohort(i, { month1RetentionPct: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`m3-${i}`}>Month 3 retention %</Label>
                    <Input id={`m3-${i}`} type="text" value={c.month3RetentionPct} onChange={(e) => updateCohort(i, { month3RetentionPct: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`retained1-${i}`}>Retained M1</Label>
                    <Input id={`retained1-${i}`} type="text" value={metrics[i]?.retainedM1?.toLocaleString() ?? "0"} readOnly />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`retained3-${i}`}>Retained M3</Label>
                    <Input id={`retained3-${i}`} type="text" value={metrics[i]?.retainedM3?.toLocaleString() ?? "0"} readOnly />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Compare retention across cohorts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              {metrics.map((row, i) => (
                <div key={i} className="rounded-md  border p-3 text-center flex flex-col items-center justify-center min-h-[96px]">
                  <div className="text-xs text-accent">{row.name}</div>
                  <div className="mt-1 text-xs text-accent">Size: {row.size.toLocaleString()}</div>
                  <div className="mt-2 font-mono text-sm leading-tight text-foreground">M1 {formatPct(row.m1Pct)}</div>
                  <div className="mt-1 font-mono text-sm leading-tight text-foreground">M3 {formatPct(row.m3Pct)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>Tips</h3>
        <ul>
          <li>Define consistent cohorts (by signup month, plan, or channel).</li>
          <li>Track early retention milestones (week 1, month 1) and long‑term (month 3+).</li>
          <li>Pair with revenue retention to understand expansion effects.</li>
        </ul>
      </section>
    </div>
  )
}