"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@oreilla/ui/components/card";
import { Input } from "@oreilla/ui/components/input";
import BackLink from "../global/backlink";

function parseNumber(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function formatCurrencyExact(value: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export default function CpaCalculatorTool() {
  const [spend, setSpend] = React.useState("15000");
  const [acquisitions, setAcquisitions] = React.useState("400");

  const s = parseNumber(spend);
  const a = parseNumber(acquisitions);
  const cpa = a === 0 ? 0 : s / a;

  return (
    <div className="space-y-6">
      <div className="prose prose-neutral dark:prose-invert">
        <h2>CPA Calculator</h2>
        <p>
          Compute cost per acquisition (CPA) by dividing total spend by acquisitions. Enter ad spend and acquired customers to estimate CPA.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card >
          <CardHeader>
            <CardTitle>Ad Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={spend} onChange={(e) => setSpend(e.target.value)} placeholder="$15,000" />
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Acquisitions</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={acquisitions} onChange={(e) => setAcquisitions(e.target.value)} placeholder="400" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <Card >
          <CardHeader>
            <CardTitle>CPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(cpa)}</div>
            <div className="text-sm text-muted-foreground">spend ÷ acquisitions</div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>What is CPA?</h3>
        <p>
          Cost per Acquisition (CPA) measures the average cost to acquire a paying customer across a campaign or channel.
        </p>
        <h3>How to use this calculator</h3>
        <p>
          Provide ad spend and the number of acquired customers. The calculator returns average CPA for budgeting and benchmarking.
        </p>
        <h3>Why it matters</h3>
        <p>
          CPA benchmarks acquisition efficiency and informs bidding, targeting, and creative optimization.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          Attribution window and definition of acquisition must be consistent. Consider CLTV and payback alongside CPA.
        </p>
        <h3>Formula</h3>
        <p>
          CPA = Total Spend ÷ Acquisitions. Use consistent definitions (e.g., paid user, MQL, SQL) to compare across channels.
        </p>
        <h3>CPA vs CAC, CPL, CPC</h3>
        <p>
          CAC (Customer Acquisition Cost) often includes non‑media costs like salaries and tooling; CPA is typically media‑only. CPL is cost per lead; CPC is cost per click. Align metric choice to funnel stage and business model.
        </p>
        <h3>Benchmarks</h3>
        <p>
          Benchmarks vary widely by industry and intent. B2B SaaS CPAs can be high given lifetime value; consumer apps may target lower CPAs. Compare CPA to CLTV and payback period, not in isolation.
        </p>
        <h3>How to reduce CPA</h3>
        <ul>
          <li>Improve targeting and exclude low‑intent segments.</li>
          <li>Test creatives and landing pages for relevance and clarity.</li>
          <li>Optimize bidding strategies and budgets by channel performance.</li>
          <li>Enhance onboarding and pricing to lift conversion rates.</li>
          <li>Use incrementality tests to avoid inefficient spend.</li>
        </ul>
        <h3>Example</h3>
        <p>
          With $15,000 spend and 400 acquisitions, CPA = $15,000 ÷ 400 = $37.50. Evaluate against CLTV and payback goals to decide scaling.
        </p>
      </div>
    </div>
  );
}