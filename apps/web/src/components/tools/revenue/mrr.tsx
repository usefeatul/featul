"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@feedgot/ui/components/card"
import { Label } from "@feedgot/ui/components/label"
import { Input } from "@feedgot/ui/components/input"
import { Badge } from "@feedgot/ui/components/badge"
import { Button } from "@feedgot/ui/components/button"
import { Plus, Trash } from "lucide-react"

type Plan = { customers: string; price: string }

export default function MrrTool() {
  const [plans, setPlans] = useState<Plan[]>([
    { customers: "200", price: "29" },
    { customers: "80", price: "49" },
  ])

  const totals = useMemo(() => {
    const toNum = (v: string) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }
    const customers = plans.reduce((s, p) => s + toNum(p.customers), 0)
    const mrr = plans.reduce((s, p) => s + toNum(p.customers) * toNum(p.price), 0)
    const arpu = customers > 0 ? mrr / customers : 0
    return { customers, mrr, arpu }
  }, [plans])

  const updatePlan = (idx: number, patch: Partial<Plan>) => {
    setPlans((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)))
  }

  // const formatCurrency = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
  const formatCurrencyExact = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Monthly recurring revenue (MRR)</h2>
        <p>
          MRR measures predictable subscription revenue in a month. Formula:
          {" "}
          <code>MRR = Σ(customers on plan × price per month)</code>.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Plan inputs</CardTitle>
            <CardDescription>Enter customers and price per month for each plan or tier.</CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPlans((prev) => [...prev, { customers: "50", price: "19" }])}
              >
                <Plus className="mr-1" /> Add plan
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plans.map((p, i) => (
                <div key={i} className="grid grid-cols-4 sm:grid-cols-3 gap-3 items-end">
                  <div className="space-y-1">
                    <Label htmlFor={`customers-${i}`}>Customers</Label>
                    <Input
                      id={`customers-${i}`}
                      type="text"
                      value={p.customers}
                      onChange={(e) => updatePlan(i, { customers: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`price-${i}`}>Price / month</Label>
                    <Input
                      id={`price-${i}`}
                      type="text"
                      value={p.price}
                      onChange={(e) => updatePlan(i, { price: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end self-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPlans((prev) => prev.filter((_, idx) => idx !== i))}
                      aria-label={`Remove plan ${i + 1}`}
                    >
                      <Trash className="mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-sm text-zinc-500">
              Total MRR <span className="font-mono ml-1 text-foreground">{formatCurrencyExact(totals.mrr)}</span>
            </div>
            <Badge variant="outline">{plans.length} plans</Badge>
          </CardFooter>
        </Card>

        {/* Summary card stacked below inputs */}
        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Overall MRR and key aggregates for quick reference.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-zinc-500">MRR</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(totals.mrr)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-zinc-500">ARPU</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(totals.arpu)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-zinc-500">Customers</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{totals.customers.toLocaleString()}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-zinc-500">Plans</div>
                <div className="mt-1 text-base leading-tight">{plans.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>MRR explained</h3>
        <p>
          Monthly recurring revenue is the backbone metric for subscription businesses. It sums the predictable revenue
          you expect from active subscriptions in a given month.
        </p>
        <p>
          Formula: <code>MRR = Σ(customers × price)</code>. Use ARPU (<code>MRR ÷ customers</code>) to compare plans or segments.
        </p>

        <h4>What each input means</h4>
        <ul>
          <li><strong>Customers</strong>: Count of paying customers on the plan.</li>
          <li><strong>Price / month</strong>: Monthly subscription price for the plan.</li>
        </ul>

        <h4>How to use the calculator</h4>
        <ol>
          <li>Add one or more plans, entering customers and price for each.</li>
          <li>Review the summary for total MRR, ARPU, and customers.</li>
          <li>Compare plans to understand mix and revenue concentration.</li>
        </ol>

        <h4>Interpreting results</h4>
        <ul>
          <li>
            Current MRR: <strong>{formatCurrencyExact(totals.mrr)}</strong> across {plans.length} plans and
            {" "}<strong>{totals.customers.toLocaleString()}</strong> customers.
          </li>
          <li>
            ARPU is <strong>{formatCurrencyExact(totals.arpu)}</strong>. Track this over time alongside churn and expansion.
          </li>
          <li>Use ARR (<code>MRR × 12</code>) for annualized planning.</li>
        </ul>

        <h4>Example</h4>
        <p>
          With {plans[0]?.customers ?? 0} customers at {formatCurrencyExact(Number(plans[0]?.price ?? 0))} and
          {" "}{plans[1]?.customers ?? 0} customers at {formatCurrencyExact(Number(plans[1]?.price ?? 0))}, total MRR is
          {" "}<code>{formatCurrencyExact(totals.mrr)}</code>. If ARPU is lower than expected, revisit tiering and value messaging.
        </p>

        <h4>Benchmarks and pitfalls</h4>
        <ul>
          <li>Exclude one‑time fees from MRR; only recurring revenue counts.</li>
          <li>Account for proration and discounts separately; keep inputs clean.</li>
          <li>Track expansion and contraction to understand net revenue movement.</li>
        </ul>

        <h4>Related metrics to track</h4>
        <ul>
          <li>ARR = MRR × 12</li>
          <li>ARPU = MRR ÷ customers</li>
          <li>Net revenue retention and churn</li>
        </ul>
      </section>
    </div>
  )
}