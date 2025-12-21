"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@oreilla/ui/components/card"
import { Label } from "@oreilla/ui/components/label"
import { Input } from "@oreilla/ui/components/input"

export default function ArrTool() {
  const [mrr, setMrr] = useState<string>("5800")

  const arr = useMemo(() => {
    const n = Number(mrr)
    return Number.isFinite(n) ? n * 12 : 0
  }, [mrr])

  const formatCurrencyExact = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Annual recurring revenue (ARR)</h2>
        <p>
          ARR annualizes your monthly recurring revenue to provide a clear yearly view of subscription revenue.
          Formula: <code>ARR = MRR × 12</code>.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter your current monthly recurring revenue.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="mrr">MRR</Label>
                <Input
                  id="mrr"
                  type="text"
                  value={mrr}
                  onChange={(e) => setMrr(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="arr">ARR</Label>
                <Input id="arr" type="text" value={formatCurrencyExact(arr)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary card */}
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Annualized view based on current monthly recurring revenue.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md  border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">ARR</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(arr)}</div>
              </div>
              <div className="rounded-md  border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">MRR</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(Number(mrr))}</div>
              </div>
              <div className="rounded-md  border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Multiplier</div>
                <div className="mt-1 text-base leading-tight">× 12</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>ARR basics</h3>
        <p>
          ARR is a simple way to express subscription revenue on an annual basis for planning, valuation, and reporting.
          It assumes your current MRR persists across 12 months.
        </p>

        <h4>What each input means</h4>
        <ul>
          <li><strong>MRR</strong>: Current monthly recurring revenue from active subscriptions.</li>
          <li><strong>ARR</strong>: Annualized revenue, <code>MRR × 12</code>.</li>
        </ul>

        <h4>How to use the calculator</h4>
        <ol>
          <li>Enter MRR from your billing system or MRR calculator.</li>
          <li>Use ARR for annual budgets and high‑level planning.</li>
          <li>Pair with growth rate to model future ARR scenarios.</li>
        </ol>

        <h4>Interpreting results</h4>
        <ul>
          <li>Today’s ARR: <strong>{formatCurrencyExact(arr)}</strong> based on MRR of <strong>{formatCurrencyExact(Number(mrr))}</strong>.</li>
          <li>ARR is sensitive to churn and expansion; model net revenue retention to project changes.</li>
        </ul>

        <h4>Common pitfalls</h4>
        <ul>
          <li>Including one‑time fees—ARR should reflect recurring revenue only.</li>
          <li>Ignoring seasonality—use averages if MRR fluctuates materially.</li>
        </ul>

        <h4>Related metrics</h4>
        <ul>
          <li>MRR (monthly recurring revenue)</li>
          <li>Growth rate (period and CAGR)</li>
          <li>Net revenue retention</li>
        </ul>
      </section>
    </div>
  )
}
