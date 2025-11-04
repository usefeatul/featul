"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@feedgot/ui/components/card";
import { Input } from "@feedgot/ui/components/input";
import  BackLink  from "../global/backlink";


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

export default function ValueBasedPricingTool() {
  const [wtpAvg, setWtpAvg] = React.useState("50");
  const [unitCost, setUnitCost] = React.useState("15");
  const [targetMarginPct, setTargetMarginPct] = React.useState("70");

  const wtp = parseNumber(wtpAvg);
  const cost = parseNumber(unitCost);
  const marginPct = parseNumber(targetMarginPct);

  const marginFloor = (1 - marginPct / 100) <= 0 ? Infinity : cost / (1 - marginPct / 100);
  const suggested = !isFinite(marginFloor) ? wtp : Math.min(Math.max(marginFloor, cost), wtp);
  const marginAtSuggested = suggested === 0 ? 0 : ((suggested - cost) / suggested) * 100;

  return (
    <div className="space-y-6">
      <div className="prose prose-neutral dark:prose-invert">
        <h2>Value-based Pricing</h2>
        <p>
          Value‑based pricing sets prices according to perceived customer value, anchored by willingness‑to‑pay (WTP) while respecting margin targets. Enter WTP, cost, and target margin to reveal a margin floor and a suggested price that balances profitability with customer value.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Average WTP</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={wtpAvg} onChange={(e) => setWtpAvg(e.target.value)} placeholder="$50" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Unit Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="$15" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Target Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={targetMarginPct} onChange={(e) => setTargetMarginPct(e.target.value)} placeholder="70%" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Margin Floor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{isFinite(marginFloor) ? formatCurrencyExact(marginFloor) : "N/A"}</div>
            <div className="text-sm text-muted-foreground">Minimum price to meet margin</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>WTP Anchor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(wtp)}</div>
            <div className="text-sm text-muted-foreground">Customer value limit</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Suggested Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(suggested)}</div>
            <div className="text-sm text-muted-foreground">Margin at suggested: {formatPct(marginAtSuggested)}</div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>How it works</h3>
        <p>
          The margin floor is calculated as cost ÷ (1 − target margin). The suggested target ensures price is not below the floor and not above average WTP.
        </p>
        <h3>Tips</h3>
        <p>
          Segment WTP by customer cohort and pair with differentiated value to create tiers that capture more surplus.
        </p>
        <h3>What is value‑based pricing?</h3>
        <p>
          Value‑based pricing sets prices according to perceived customer value rather than cost‑plus. It seeks to capture a fair share of surplus created by product benefits.
        </p>
        <h3>How to use this calculator</h3>
        <p>
          Provide average willingness‑to‑pay (survey or research), unit cost, and target margin. The tool shows a margin floor and a suggested price anchored to WTP so you meet margin goals without overshooting perceived value.
        </p>
        <h3>Why it matters</h3>
        <p>
          Prices aligned to customer value improve revenue quality and reduce churn from mispriced offerings. They also inform tiering strategies by cohort.
        </p>
        <h3>Example</h3>
        <p>
          If cost is $15 and target margin is 70%, the margin floor is $50 (15 ÷ 0.3). With average WTP of $55, a suggested target near $50–$55 balances margin and value perception.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          WTP varies by segment and context. Use robust sampling, avoid anchoring bias, and revisit inputs as product value changes.
        </p>
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is value-based pricing?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'A pricing approach that sets prices based on perceived customer value rather than cost-plus alone.'
              }
            },
            {
              '@type': 'Question',
              name: 'How do I use the calculator?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Enter average willingness to pay, unit cost, and target margin to see price floors and a suggested target.'
              }
            },
            {
              '@type': 'Question',
              name: 'Why does value-based pricing matter?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'It aligns price with customer-perceived benefits, improving revenue quality and retention.'
              }
            },
            {
              '@type': 'Question',
              name: 'What are common pitfalls?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Poor WTP sampling, anchoring bias, ignoring segment differences, and setting prices above perceived value.'
              }
            }
          ]
        })}
      </script>
    </div>
  );
}