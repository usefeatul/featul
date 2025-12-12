"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@oreilla/ui/components/card"
import { Label } from "@oreilla/ui/components/label"
import { Input } from "@oreilla/ui/components/input"

export default function CacTool() {
  const [totalSpend, setTotalSpend] = useState<string>("15000")
  const [newCustomers, setNewCustomers] = useState<string>("120")

  const cac = useMemo(() => {
    const spend = Number(totalSpend)
    const acquired = Number(newCustomers)
    return Number.isFinite(spend) && Number.isFinite(acquired) && acquired > 0 ? spend / acquired : 0
  }, [totalSpend, newCustomers])

  const formatCurrencyExact = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Customer Acquisition Cost (CAC)</h2>
        <p>
          CAC measures the average cost to acquire one paying customer over a period.
          Formula: <code>CAC = Total sales & marketing spend ÷ New customers acquired</code>.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter period spend and new customers acquired.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="spend">Sales & marketing spend</Label>
                <Input id="spend" type="text" value={totalSpend} onChange={(e) => setTotalSpend(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="acquired">New customers acquired</Label>
                <Input id="acquired" type="text" value={newCustomers} onChange={(e) => setNewCustomers(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cac">CAC</Label>
                <Input id="cac" type="text" value={formatCurrencyExact(cac)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Average acquisition cost for the period.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">CAC</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(cac)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Spend</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(Number(totalSpend))}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">New customers</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{newCustomers.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>CAC basics</h3>
        <p>Track CAC over time and by acquisition channel to optimize efficiency.</p>

        <h4>How to use the calculator</h4>
        <ol>
          <li>Enter period sales & marketing spend and new customers acquired.</li>
          <li>Monitor CAC by cohort (campaign, channel, geography).</li>
          <li>Compare CAC to CLTV for sustainability.</li>
        </ol>

        <h4>Related metrics</h4>
        <ul>
          <li>CLTV/CAC ratio</li>
          <li>CAC payback period</li>
          <li>Activation and retention rates</li>
        </ul>
      </section>
    </div>
  )
}