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
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Ad Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={spend} onChange={(e) => setSpend(e.target.value)} placeholder="$15,000" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Acquisitions</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={acquisitions} onChange={(e) => setAcquisitions(e.target.value)} placeholder="400" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <Card className="bg-muted">
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
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'How is CPA calculated?', acceptedAnswer: { '@type': 'Answer', text: 'CPA = Total Ad Spend ÷ Number of Acquisitions.' } },
            { '@type': 'Question', name: 'When should I use CPA?', acceptedAnswer: { '@type': 'Answer', text: 'Use CPA to compare acquisition efficiency across campaigns and channels.' } },
          ],
        })}
      </script>
    </div>
  );
}