"use client";

import React from "react";
import BackLink from "@/components/tools/global/backlink";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@feedgot/ui/components/card";
import { Label } from "@feedgot/ui/components/label";
import { Input } from "@feedgot/ui/components/input";

const parseNumber = (v: string) => {
  const n = Number((v || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const formatCurrencyExact = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const formatPct = (n: number) => `${n.toFixed(1)}%`;

export default function NetMarginTool() {
  const [revenue, setRevenue] = React.useState("500000");
  const [netIncome, setNetIncome] = React.useState("50000");

  const netMarginPct = React.useMemo(() => {
    const r = parseNumber(revenue);
    const n = parseNumber(netIncome);
    return r > 0 ? (n / r) * 100 : 0;
  }, [revenue, netIncome]);

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Net Margin</h2>
        <p>
          Net margin shows profitability after all expenses. Formula: <code>Net margin = Net income ÷ Revenue</code>. Use this calculator to measure bottom‑line profitability. Enter total revenue and net income to compute net margin and compare performance across periods.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card >
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter revenue and net income.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="revenue">Revenue</Label>
                <Input id="revenue" type="text" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="net">Net income</Label>
                <Input id="net" type="text" value={netIncome} onChange={(e) => setNetIncome(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nm">Net margin</Label>
                <Input id="nm" type="text" value={formatPct(netMarginPct)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Net margin and inputs overview.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Net margin</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatPct(netMarginPct)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Net income</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(parseNumber(netIncome))}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Revenue</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(parseNumber(revenue))}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />

        <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6">
          <h3>What is net margin?</h3>
          <p>
            Net margin measures the percent of revenue left after <em>all</em> expenses, including operating and non‑operating items.
            It reflects true bottom‑line profitability.
          </p>
          <h3>Why it matters</h3>
          <ul>
            <li>Shows how efficiently revenue converts to profit.</li>
            <li>Complements gross margin by accounting for the full cost structure.</li>
            <li>Important for valuation and long‑term sustainability.</li>
          </ul>
          <h3>How to calculate</h3>
          <p>Net margin (%) = Net income ÷ Revenue × 100.</p>
          <h3>Example</h3>
          <p>Revenue {formatCurrencyExact(parseNumber(revenue))}, Net income {formatCurrencyExact(parseNumber(netIncome))} ⇒ Net margin {formatPct(netMarginPct)}.</p>
          <h3>Improving net margin</h3>
          <ul>
            <li>Increase pricing power and reduce discounts.</li>
            <li>Improve gross margin (lower delivery costs) and optimize OpEx.</li>
            <li>Streamline go‑to‑market and automate manual processes.</li>
          </ul>
          <h3>FAQ</h3>
          <p><strong>How does net margin differ from gross margin?</strong> Gross margin excludes operating expenses; net margin includes them.</p>
          <p><strong>What’s a good net margin in SaaS?</strong> It varies widely by stage; low single digits in growth, higher in mature firms.</p>
          <p><strong>Should I exclude one‑time costs?</strong> Track adjusted margin for comparability, but keep GAAP margin for completeness.</p>
        </div>
      </div>
    </div>
  );
}