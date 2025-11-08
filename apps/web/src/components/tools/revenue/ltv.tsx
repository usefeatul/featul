"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@feedgot/ui/components/card"
import { Label } from "@feedgot/ui/components/label"
import { Input } from "@feedgot/ui/components/input"

export default function LtvTool() {
  const [arpu, setArpu] = useState<string>("20.7")
  const [churnPct, setChurnPct] = useState<string>("3.5") // monthly %
  const [grossMarginPct, setGrossMarginPct] = useState<string>("80")

  const metrics = useMemo(() => {
    const a = Number(arpu)
    const cPct = Number(churnPct)
    const gmPct = Number(grossMarginPct)
    const churn = Number.isFinite(cPct) ? Math.max(0, Math.min(100, cPct)) / 100 : 0
    const gm = Number.isFinite(gmPct) ? Math.max(0, Math.min(100, gmPct)) / 100 : 0
    const ltv = Number.isFinite(a) && churn > 0 ? a * gm * (1 / churn) : 0
    const lifetimeMonths = churn > 0 ? 1 / churn : 0
    return { ltv, lifetimeMonths }
  }, [arpu, churnPct, grossMarginPct])

  const formatCurrencyExact = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })
  const formatPct = (n: number) => `${n.toFixed(1)}%`

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Customer lifetime value (LTV)</h2>
        <p>
          LTV estimates the gross‑margin adjusted revenue per customer over their lifetime. Formula:
          {" "}
          <code>LTV = ARPU × gross margin × (1 ÷ monthly churn)</code>.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter ARPU, monthly churn, and gross margin.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="arpu">ARPU</Label>
                <Input id="arpu" type="text" value={arpu} onChange={(e) => setArpu(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="churn">Monthly churn %</Label>
                <Input id="churn" type="text" value={churnPct} onChange={(e) => setChurnPct(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="gm">Gross margin %</Label>
                <Input id="gm" type="text" value={grossMarginPct} onChange={(e) => setGrossMarginPct(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ltv">LTV</Label>
                <Input id="ltv" type="text" value={formatCurrencyExact(metrics.ltv)} readOnly />
              </div>
              <div className="space-y-1">
                <Label htmlFor="life">Lifetime (months)</Label>
                <Input id="life" type="text" value={isFinite(metrics.lifetimeMonths) ? metrics.lifetimeMonths.toFixed(1) : "0.0"} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary card */}
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Gross‑margin adjusted lifetime value and implied lifetime.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">LTV</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(metrics.ltv)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">ARPU</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(Number(arpu))}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Churn</div>
                <div className="mt-1 font-mono text-base leading-tight">{formatPct(Number(churnPct))}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Gross margin</div>
                <div className="mt-1 font-mono text-base leading-tight">{formatPct(Number(grossMarginPct))}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>LTV basics</h3>
        <p>
          LTV estimates the revenue you earn per customer over their lifetime, adjusted for gross margin. It depends heavily on churn.
        </p>

        <h4>How to use the calculator</h4>
        <ol>
          <li>Enter ARPU (from your ARPU calculator or billing data).</li>
          <li>Enter monthly churn rate as a percentage.</li>
          <li>Set gross margin to reflect your product’s cost of goods sold.</li>
        </ol>

        <h4>Interpreting results</h4>
        <ul>
          <li>Implied lifetime: <strong>{isFinite(metrics.lifetimeMonths) ? metrics.lifetimeMonths.toFixed(1) : "0.0"}</strong> months.</li>
          <li>LTV today: <strong>{formatCurrencyExact(metrics.ltv)}</strong>. Compare to CAC to evaluate payback.</li>
        </ul>

        <h4>Pitfalls</h4>
        <ul>
          <li>Using revenue instead of gross margin—adjust for COGS.</li>
          <li>Mixing customer churn with revenue churn—be consistent with definitions.</li>
        </ul>

        <h4>Related metrics</h4>
        <ul>
          <li>CAC and CAC payback period</li>
          <li>ARPU and churn</li>
          <li>Net revenue retention</li>
        </ul>
      </section>
    </div>
  )
}