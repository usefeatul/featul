"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@oreilla/ui/components/card"
import { Label } from "@oreilla/ui/components/label"
import { Input } from "@oreilla/ui/components/input"

export default function NpsTool() {
  const [promoters, setPromoters] = useState<string>("120")
  const [passives, setPassives] = useState<string>("60")
  const [detractors, setDetractors] = useState<string>("20")

  const metrics = useMemo(() => {
    const p = Number(promoters)
    const pa = Number(passives)
    const d = Number(detractors)
    const total = [p, pa, d].every(Number.isFinite) ? Math.max(0, p + pa + d) : 0
    const promoterPct = total > 0 ? (p / total) * 100 : 0
    const detractorPct = total > 0 ? (d / total) * 100 : 0
    const nps = Math.round(promoterPct - detractorPct)
    return { total, promoterPct, detractorPct, nps }
  }, [promoters, passives, detractors])

  const formatPct = (n: number) => `${n.toFixed(1)}%`

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Net Promoter Score (NPS)</h2>
        <p>
          NPS measures customer loyalty based on 0–10 ratings grouped into {"Promoters"} (9–10), {"Passives"} (7–8),
          and {"Detractors"} (0–6).
        </p>
        <p>
          Formula: <code>NPS = % Promoters − % Detractors</code>. Passives count toward total responses but do not directly affect the score.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter counts by group from your survey.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="promoters">Promoters (9–10)</Label>
                <Input id="promoters" type="text" value={promoters} onChange={(e) => setPromoters(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="passives">Passives (7–8)</Label>
                <Input id="passives" type="text" value={passives} onChange={(e) => setPassives(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="detractors">Detractors (0–6)</Label>
                <Input id="detractors" type="text" value={detractors} onChange={(e) => setDetractors(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="total">Total responses</Label>
                <Input id="total" type="text" value={metrics.total.toLocaleString()} readOnly />
              </div>
              <div className="space-y-1">
                <Label htmlFor="promoter-pct">Promoters %</Label>
                <Input id="promoter-pct" type="text" value={formatPct(metrics.promoterPct)} readOnly />
              </div>
              <div className="space-y-1">
                <Label htmlFor="detractor-pct">Detractors %</Label>
                <Input id="detractor-pct" type="text" value={formatPct(metrics.detractorPct)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Survey distribution and NPS score.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">NPS</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.nps}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Promoters</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatPct(metrics.promoterPct)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Detractors</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatPct(metrics.detractorPct)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Responses</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{metrics.total.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>NPS basics</h3>
        <p>
          NPS ranges from −100 to +100. Higher scores indicate greater loyalty and word‑of‑mouth potential.
        </p>

        <h4>How to use the calculator</h4>
        <ol>
          <li>Enter counts of promoters, passives, and detractors.</li>
          <li>Review the distribution and the resulting NPS score.</li>
          <li>Segment by cohort (e.g., plan, acquisition source) for deeper insight.</li>
        </ol>

        <h4>Pitfalls</h4>
        <ul>
          <li>Small sample sizes—aggregate cohorts or extend survey window.</li>
          <li>Unbalanced sampling—ensure representative coverage across customer segments.</li>
        </ul>
      </section>
    </div>
  )
}