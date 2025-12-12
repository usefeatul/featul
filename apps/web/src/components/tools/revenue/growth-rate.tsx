"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@oreilla/ui/components/card"
import { Label } from "@oreilla/ui/components/label"
import { Input } from "@oreilla/ui/components/input"

export default function GrowthRateTool() {
  const [start, setStart] = useState<string>("5000")
  const [end, setEnd] = useState<string>("6500")
  const [months, setMonths] = useState<string>("6")

  const metrics = useMemo(() => {
    const s = Number(start)
    const e = Number(end)
    const m = Number(months)
    const sOk = Number.isFinite(s) && s > 0
    const mOk = Number.isFinite(m) && m > 0
    const periodGrowth = sOk && Number.isFinite(e) ? ((e - s) / s) * 100 : 0
    const cagr = sOk && mOk && Number.isFinite(e) ? (Math.pow(e / s, 1 / m) - 1) * 100 : 0
    return { periodGrowth, cagr }
  }, [start, end, months])

  const formatPct = (n: number) => `${n.toFixed(1)}%`

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Growth rate calculator</h2>
        <p>
          Measure period growth and compound growth. Period growth is
          {" "}
          <code>((end − start) ÷ start) × 100%</code> and monthly CAGR is
          {" "}
          <code>(((end ÷ start)^(1 ÷ months)) − 1) × 100%</code>.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter start and end values and the number of months.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="start">Start value</Label>
                <Input id="start" type="text" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end">End value</Label>
                <Input id="end" type="text" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="months">Months</Label>
                <Input id="months" type="text" value={months} onChange={(e) => setMonths(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary card */}
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Period growth and monthly compound growth.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Period growth</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatPct(metrics.periodGrowth)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Monthly CAGR</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatPct(metrics.cagr)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Months</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{months}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>Growth rate basics</h3>
        <p>
          Period growth shows the percentage change between two values. CAGR smooths growth across multiple months to
          capture the average monthly rate.
        </p>

        <h4>How to use the calculator</h4>
        <ol>
          <li>Enter starting and ending values (e.g., MRR).</li>
          <li>Specify the number of months between them.</li>
          <li>Use period growth for reporting and CAGR for trend comparisons.</li>
        </ol>

        <h4>Interpreting results</h4>
        <ul>
          <li>Period growth: <strong>{formatPct(metrics.periodGrowth)}</strong>.</li>
          <li>Monthly CAGR: <strong>{formatPct(metrics.cagr)}</strong>. Annualize by multiplying by 12 for a rough comparison.</li>
        </ul>

        <h4>Pitfalls</h4>
        <ul>
          <li>Short periods can exaggerate CAGR—compare similar durations.</li>
          <li>Outliers and seasonality can skew period growth—use smoothed values.</li>
        </ul>
      </section>
    </div>
  )
}