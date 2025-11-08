"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@feedgot/ui/components/card";
import { Input } from "@feedgot/ui/components/input";
import BackLink from "../global/backlink";

function parseNumber(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function formatCurrencyExact(value: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

function formatPct(value: number): string {
  return `${value.toFixed(2)}%`;
}

export default function RoiCalculatorTool() {
  const [investment, setInvestment] = React.useState("10000");
  const [returnAmt, setReturnAmt] = React.useState("13000");

  const cost = parseNumber(investment);
  const revenue = parseNumber(returnAmt);
  const netProfit = revenue - cost;
  const roi = cost === 0 ? 0 : (netProfit / cost) * 100;
  const payback = cost === 0 ? 0 : revenue / cost;

  return (
    <div className="space-y-6">
      <div className="prose prose-neutral dark:prose-invert">
        <h2>ROI Calculator</h2>
        <p>
          Estimate return on investment (ROI) by comparing net profit to the invested amount. Enter campaign cost and return to compute ROI%, net profit, and payback factor.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Investment Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={investment} onChange={(e) => setInvestment(e.target.value)} placeholder="$10,000" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Return (Revenue/Profit)</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={returnAmt} onChange={(e) => setReturnAmt(e.target.value)} placeholder="$13,000" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(roi)}</div>
            <div className="text-sm text-muted-foreground">(Return − Cost) ÷ Cost</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(netProfit)}</div>
            <div className="text-sm text-muted-foreground">Return − cost</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payback Factor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{payback.toFixed(2)}×</div>
            <div className="text-sm text-muted-foreground">Return ÷ cost</div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>What is ROI?</h3>
        <p>
          Return on Investment (ROI) measures the efficiency of an investment. It compares net profit to the cost required to generate that profit.
        </p>
        <h3>How to use this calculator</h3>
        <p>
          Input the investment cost and the realized return (revenue or profit). The calculator outputs ROI%, net profit, and the payback factor to assess efficiency.
        </p>
        <h3>Why it matters</h3>
        <p>
          ROI helps prioritize initiatives by expected efficiency and payback. It is key for budgeting and evaluating campaign performance.
        </p>
        <h3>Example</h3>
        <p>
          If a campaign costs $10,000 and generates $13,000 of revenue, net profit is $3,000, ROI is 30%, and payback is 1.3×.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          ROI can ignore time value and non‑monetary benefits. Consider risk, attribution accuracy, and long‑term effects.
        </p>
        <h3>Formula</h3>
        <p>
          ROI = (Return − Cost) ÷ Cost × 100%. Payback factor = Return ÷ Cost. Net profit = Return − Cost.
        </p>
        <h3>ROI vs ROMI vs ROAS</h3>
        <p>
          ROI measures overall investment efficiency. ROMI focuses on marketing by converting attributed revenue to profit using margin. ROAS (Return on Ad Spend) is revenue ÷ ad spend and ignores margin, so it can mislead if margins are thin.
        </p>
        <h3>Payback period</h3>
        <p>
          Payback indicates how quickly returns cover costs. A payback &gt; 1.0× means the campaign returned more than it cost; shorter periods reduce capital risk.
        </p>
        <h3>Time value (NPV, IRR)</h3>
        <p>
          For multi‑period investments, use discounted cash flows. Net Present Value (NPV) and Internal Rate of Return (IRR) incorporate the time value of money and are more robust than simple ROI.
        </p>
        <h3>Step‑by‑step example</h3>
        <p>
          Cost = $10,000, Return = $13,000 → Net profit = $3,000, ROI = $3,000 ÷ $10,000 × 100% = 30%, Payback = $13,000 ÷ $10,000 = 1.3×.
        </p>
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'What is ROI?', acceptedAnswer: { '@type': 'Answer', text: 'Return on Investment compares net profit to investment cost to evaluate efficiency.' } },
            { '@type': 'Question', name: 'How do I calculate ROI?', acceptedAnswer: { '@type': 'Answer', text: 'ROI = (Return − Cost) ÷ Cost × 100%.' } },
            { '@type': 'Question', name: 'When is ROI useful?', acceptedAnswer: { '@type': 'Answer', text: 'Use ROI to compare initiatives, prioritize budgets, and track campaign efficiency.' } },
            { '@type': 'Question', name: 'What is the difference between ROI, ROMI, and ROAS?', acceptedAnswer: { '@type': 'Answer', text: 'ROI is overall investment efficiency, ROMI uses margin to convert attributed revenue to profit, and ROAS is revenue ÷ ad spend without margin.' } },
            { '@type': 'Question', name: 'Is 30% ROI good?', acceptedAnswer: { '@type': 'Answer', text: 'It depends on risk, payback period, and opportunity cost. Compare against your hurdle rate and alternatives.' } },
          ],
        })}
      </script>
    </div>
  );
}