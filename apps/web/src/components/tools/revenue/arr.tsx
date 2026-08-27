"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import BackLink from "@/components/tools/global/backlink"
import ToolProductCta from "@/components/tools/global/product-cta"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"

export default function ArrTool() {
  const [mrr, setMrr] = useState<string>("5800")

  const arr = useMemo(() => {
    const n = Number(mrr)
    return Number.isFinite(n) ? n * 12 : 0
  }, [mrr])

  const formatCurrencyExact = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })
  const mrrValue = Number(mrr)
  const safeMrr = Number.isFinite(mrrValue) ? mrrValue : 0

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Annual recurring revenue (ARR) calculator</h2>
        <p>
          ARR annualizes monthly recurring revenue so you can report subscription scale on a yearly basis.
          The basic formula is <code>ARR = MRR × 12</code>. Read the{" "}
          <Link href="/definitions/arr">ARR definition</Link> for contracted annual values, ARR vs MRR,
          and how product teams weight feedback by customer ARR.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter current monthly recurring revenue from active subscriptions only.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="mrr">MRR</Label>
                <Input
                  id="mrr"
                  type="text"
                  inputMode="decimal"
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
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(safeMrr)}</div>
              </div>
              <div className="rounded-md  border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Multiplier</div>
                <div className="mt-1 text-base leading-tight">× 12</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ToolProductCta
          title="Use ARR when you prioritize feedback"
          description="In Featul, B2B teams attach customer value to requests so a high-ARR account is not ranked the same as a free-tier upvote. Boards, roadmap, and changelog stay in one workspace."
        />

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>What ARR means</h3>
        <p>
          Annual Recurring Revenue is the yearly run-rate of active subscriptions. Boards and investors prefer ARR
          because it smooths month-to-month swings. It is not cash collected this year, and it is not GAAP revenue.
          If you need the formal definition, examples, and pitfalls, see{" "}
          <Link href="/definitions/arr">what ARR is</Link>.
        </p>

        <h4>ARR vs MRR</h4>
        <p>
          <Link href="/definitions/mrr">Monthly Recurring Revenue (MRR)</Link> is the operating view.
          ARR is the same recurring base expressed annually. This calculator uses{" "}
          <code>ARR = 12 × MRR</code>, which is correct when nearly all contracts are monthly. If you mix annual
          prepay with monthly plans, convert each contract to a twelve-month value first so you do not double-count.
        </p>

        <h4>What each input means</h4>
        <ul>
          <li><strong>MRR</strong>: Current monthly recurring revenue from active subscriptions. Exclude trials, setup fees, and one-time services.</li>
          <li><strong>ARR</strong>: Annualized recurring revenue, <code>MRR × 12</code>.</li>
        </ul>

        <h4>How to use this ARR calculator</h4>
        <ol>
          <li>Enter MRR from billing, or compute it first with the <Link href="/tools/categories/revenue-metrics/mrr-calculator">MRR calculator</Link>.</li>
          <li>Use the ARR result for annual budgets, board decks, and hiring plans.</li>
          <li>Pair ARR with <Link href="/definitions/nrr">net revenue retention</Link> so new logos are not hiding churn.</li>
        </ol>

        <h4>Interpreting results</h4>
        <ul>
          <li>Today’s ARR: <strong>{formatCurrencyExact(arr)}</strong> based on MRR of <strong>{formatCurrencyExact(safeMrr)}</strong>.</li>
          <li>ARR moves with churn and expansion. Model net retention before you treat this number as next year’s budget.</li>
          <li>A jump in ARR from one large annual contract can look like growth even if monthly logo volume is flat. Segment new, expansion, and churned ARR.</li>
        </ul>

        <h4>Use case: revenue-weighted feedback</h4>
        <p>
          Product teams in B2B SaaS should not rank a public board by votes alone. Attach customer ARR to each
          request so a $200k account asking for an export is visible beside 40 free-tier upvotes. See the{" "}
          <Link href="/use-cases/b2b-customer-feedback">B2B customer feedback use case</Link> for that workflow
          in Featul: private boards for key accounts, then a shared roadmap and changelog.
        </p>

        <h4>Common pitfalls</h4>
        <ul>
          <li>Including one-time fees. ARR should reflect recurring revenue only.</li>
          <li>Annualizing a promotional or seasonal month. Average a clean period if MRR is volatile.</li>
          <li>Counting a three-year prepayment as three years of ARR at once. Use annual contracted value.</li>
        </ul>

        <h4>Related metrics</h4>
        <ul>
          <li><Link href="/definitions/mrr">MRR</Link> and the <Link href="/tools/categories/revenue-metrics/mrr-calculator">MRR calculator</Link></li>
          <li><Link href="/tools/categories/revenue-metrics/growth-rate-calculator">Growth rate</Link></li>
          <li><Link href="/definitions/nrr">Net revenue retention</Link></li>
        </ul>
      </section>
    </div>
  )
}
