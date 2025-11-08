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

export default function RomiCalculatorTool() {
  const [spend, setSpend] = React.useState("20000");
  const [attributedRevenue, setAttributedRevenue] = React.useState("60000");
  const [grossMarginPct, setGrossMarginPct] = React.useState("60");

  const mSpend = parseNumber(spend);
  const rev = parseNumber(attributedRevenue);
  const margin = parseNumber(grossMarginPct) / 100;
  const incrProfit = rev * (isNaN(margin) ? 0 : margin);
  const romi = mSpend === 0 ? 0 : ((incrProfit - mSpend) / mSpend) * 100;
  const revenueToSpend = mSpend === 0 ? 0 : rev / mSpend;

  return (
    <div className="space-y-6">
      <div className="prose prose-neutral dark:prose-invert">
        <h2>ROMI Calculator</h2>
        <p>
          Calculate Return on Marketing Investment (ROMI) using attributed revenue and gross margin to estimate incremental profit. Enter spend, revenue, and margin to compute ROMI%, incremental profit, and revenue‑to‑spend ratio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card >
          <CardHeader>
            <CardTitle>Marketing Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={spend} onChange={(e) => setSpend(e.target.value)} placeholder="$20,000" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attributed Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={attributedRevenue} onChange={(e) => setAttributedRevenue(e.target.value)} placeholder="$60,000" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gross Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={grossMarginPct} onChange={(e) => setGrossMarginPct(e.target.value)} placeholder="60%" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>ROMI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(romi)}</div>
            <div className="text-sm text-muted-foreground">(Incremental profit − spend) ÷ spend</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Incremental Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(incrProfit)}</div>
            <div className="text-sm text-muted-foreground">Revenue × margin</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue ÷ Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{revenueToSpend.toFixed(2)}×</div>
            <div className="text-sm text-muted-foreground">Efficiency ratio</div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>What is ROMI?</h3>
        <p>
          Return on Marketing Investment (ROMI) measures how effectively marketing spend generates profit. It uses margin to convert revenue into incremental profit.
        </p>
        <h3>How to use this calculator</h3>
        <p>
          Enter marketing spend, attributed revenue, and gross margin. The calculator returns ROMI%, incremental profit, and the revenue‑to‑spend ratio.
        </p>
        <h3>Why it matters</h3>
        <p>
          ROMI guides budget allocation by identifying which channels or campaigns deliver profitable growth.
        </p>
        <h3>Example</h3>
        <p>
          $20k spend, $60k revenue, 60% margin → incremental profit $36k, ROMI 80%, revenue‑to‑spend ratio 3.0×.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          Attribution and margin accuracy are critical. Consider lag effects and non‑direct benefits like brand lift.
        </p>
        <h3>Formula</h3>
        <p>
          Incremental profit = Attributed revenue × Gross margin. ROMI = (Incremental profit − Spend) ÷ Spend × 100%. Revenue‑to‑spend ratio = Attributed revenue ÷ Spend.
        </p>
        <h3>ROMI vs ROAS vs ROI</h3>
        <p>
          ROAS focuses on revenue per dollar of ad spend (revenue ÷ spend) and ignores margin. ROMI incorporates margin to reflect profit. ROI applies more broadly to any investment and can include fixed costs beyond marketing.
        </p>
        <h3>Attribution and incremental lift</h3>
        <p>
          Accurate ROMI depends on incremental effects, not just correlated revenue. Use experiments or causal modeling to separate true lift from baseline demand and halo effects.
        </p>
        <h3>Best practices and pitfalls</h3>
        <ul>
          <li>Use consistent margin assumptions by product mix and channel.</li>
          <li>Account for time lags and repeat purchases where relevant.</li>
          <li>Validate attribution with controlled tests or MMM.</li>
          <li>Combine ROMI with payback and CLTV to guide scaling decisions.</li>
        </ul>
      </div>
    </div>
  );
}