"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@oreilla/ui/components/card"
import { Label } from "@oreilla/ui/components/label"
import { Input } from "@oreilla/ui/components/input"

export default function ChurnTool() {
  const [startCustomers, setStartCustomers] = useState<string>("300")
  const [lostCustomers, setLostCustomers] = useState<string>("12")
  const [startMrr, setStartMrr] = useState<string>("5800")
  const [lostMrr, setLostMrr] = useState<string>("400")

  const metrics = useMemo(() => {
    const sC = Number(startCustomers)
    const lC = Number(lostCustomers)
    const sM = Number(startMrr)
    const lM = Number(lostMrr)
    const customerChurn = Number.isFinite(sC) && sC > 0 && Number.isFinite(lC) ? (lC / sC) * 100 : 0
    const retention = 100 - customerChurn
    const revenueChurn = Number.isFinite(sM) && sM > 0 && Number.isFinite(lM) ? (lM / sM) * 100 : 0
    return { customerChurn, retention, revenueChurn }
  }, [startCustomers, lostCustomers, startMrr, lostMrr])

  const formatPct = (n: number) => `${n.toFixed(1)}%`

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Customer churn</h2>
        <p>
          Customer churn measures the percentage of customers lost in a period. Revenue churn measures the percentage of
          recurring revenue lost due to churn.
        </p>
        <p>
          Formulas: <code>Customer churn = (Customers lost ÷ Customers at start) × 100%</code>,
          {" "}
          <code>Revenue churn = (MRR lost ÷ MRR at start) × 100%</code>.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter period start values and losses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="start-customers">Customers at start</Label>
                <Input id="start-customers" type="text" value={startCustomers} onChange={(e) => setStartCustomers(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lost-customers">Customers lost</Label>
                <Input id="lost-customers" type="text" value={lostCustomers} onChange={(e) => setLostCustomers(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="start-mrr">MRR at start</Label>
                <Input id="start-mrr" type="text" value={startMrr} onChange={(e) => setStartMrr(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lost-mrr">MRR lost</Label>
                <Input id="lost-mrr" type="text" value={lostMrr} onChange={(e) => setLostMrr(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="customer-churn">Customer churn</Label>
                <Input id="customer-churn" type="text" value={formatPct(metrics.customerChurn)} readOnly />
              </div>
              <div className="space-y-1">
                <Label htmlFor="revenue-churn">Revenue churn</Label>
                <Input id="revenue-churn" type="text" value={formatPct(metrics.revenueChurn)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Churn and retention for the period.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md  border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Customer churn</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatPct(metrics.customerChurn)}</div>
              </div>
              <div className="rounded-md  border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Retention</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatPct(metrics.retention)}</div>
              </div>
              <div className="rounded-md  border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Revenue churn</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatPct(metrics.revenueChurn)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>Churn basics</h3>
        <p>
          Customer churn counts users who cancel or lapse during the period. Revenue churn captures the lost MRR from those
          churned customers.
        </p>

        <h4>How to use the calculator</h4>
        <ol>
          <li>Enter customers and MRR at the start of the period.</li>
          <li>Enter customers lost and MRR lost from churn.</li>
          <li>Review churn percentages and retention.</li>
        </ol>

        <h4>Pitfalls</h4>
        <ul>
          <li>Mixing customer churn with revenue churn—report both separately.</li>
          <li>Not normalizing for upgrades/downgrades—exclude expansion/contraction from churn inputs.</li>
        </ul>
      </section>
    </div>
  )
}