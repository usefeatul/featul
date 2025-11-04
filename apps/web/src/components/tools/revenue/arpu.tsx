"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@feedgot/ui/components/card"
import { Label } from "@feedgot/ui/components/label"
import { Input } from "@feedgot/ui/components/input"

export default function ArpuTool() {
  const [mrr, setMrr] = useState<string>("5800")
  const [customers, setCustomers] = useState<string>("280")

  const arpu = useMemo(() => {
    const m = Number(mrr)
    const c = Number(customers)
    return Number.isFinite(m) && Number.isFinite(c) && c > 0 ? m / c : 0
  }, [mrr, customers])

  const formatCurrencyExact = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Average revenue per user (ARPU)</h2>
        <p>
          ARPU measures average monthly revenue per paying customer. Formula: <code>ARPU = MRR ÷ customers</code>.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter monthly recurring revenue and active customers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="mrr">MRR</Label>
                <Input id="mrr" type="text" value={mrr} onChange={(e) => setMrr(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="customers">Customers</Label>
                <Input id="customers" type="text" value={customers} onChange={(e) => setCustomers(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="arpu">ARPU</Label>
                <Input id="arpu" type="text" value={formatCurrencyExact(arpu)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary card */}
        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Average monthly revenue per user.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-zinc-500">ARPU</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(arpu)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-zinc-500">MRR</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(Number(mrr))}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-zinc-500">Customers</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{customers.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>ARPU basics</h3>
        <p>
          ARPU helps compare value across segments and track monetization over time. Pair ARPU with churn to calculate LTV.
        </p>

        <h4>How to use the calculator</h4>
        <ol>
          <li>Enter current MRR and active customer count.</li>
          <li>Use ARPU to evaluate pricing and tier performance.</li>
          <li>Monitor ARPU trends after launches and pricing changes.</li>
        </ol>

        <h4>Interpreting results</h4>
        <ul>
          <li>ARPU today: <strong>{formatCurrencyExact(arpu)}</strong>.</li>
          <li>Rising ARPU can indicate successful upsell or improved tier mix.</li>
        </ul>

        <h4>Related metrics</h4>
        <ul>
          <li>LTV = ARPU ÷ churn rate (monthly)</li>
          <li>MRR and ARR</li>
          <li>Net revenue retention</li>
        </ul>
      </section>
    </div>
  )
}