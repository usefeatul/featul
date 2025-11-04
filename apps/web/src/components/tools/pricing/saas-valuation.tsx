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
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function SaasValuationTool() {
  const [arr, setArr] = React.useState("1200000");
  const [multiple, setMultiple] = React.useState("8");
  const [growthPct, setGrowthPct] = React.useState("40");
  const [marginPct, setMarginPct] = React.useState("75");

  const ARR = parseNumber(arr);
  const baseMultiple = parseNumber(multiple);
  const growth = parseNumber(growthPct);
  const margin = parseNumber(marginPct);

  const enterpriseValue = ARR * baseMultiple;
  const sensitivityMinus = ARR * Math.max(baseMultiple - 1, 0);
  const sensitivityPlus = ARR * (baseMultiple + 1);

  return (
    <div className="space-y-6">
      <div className="prose prose-neutral dark:prose-invert">
        <h2>SaaS Valuation</h2>
        <p>
          Estimate enterprise value using ARR multiples from market comps. Input ARR and a revenue multiple to get a base valuation and ±1× sensitivity, with growth and margin fields to document context for stakeholders.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={arr} onChange={(e) => setArr(e.target.value)} placeholder="$1,200,000" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Revenue Multiple</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={multiple} onChange={(e) => setMultiple(e.target.value)} placeholder="8" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={growthPct} onChange={(e) => setGrowthPct(e.target.value)} placeholder="40%" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Gross Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={marginPct} onChange={(e) => setMarginPct(e.target.value)} placeholder="75%" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Enterprise Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(enterpriseValue)}</div>
            <div className="text-sm text-muted-foreground">ARR × multiple</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Sensitivity −1x</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(sensitivityMinus)}</div>
            <div className="text-sm text-muted-foreground">Lower-bound check</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Sensitivity +1x</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(sensitivityPlus)}</div>
            <div className="text-sm text-muted-foreground">Upper-bound check</div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>Context</h3>
        <p>
          Multiples vary with growth, margin, net dollar retention, and market conditions. Use sensitivity to frame a range and pair with comps.
        </p>
        <h3>What is SaaS valuation?</h3>
        <p>
          SaaS valuation often uses revenue multiples on ARR, adjusted for growth, gross margin, retention, and profitability. It provides a directional estimate for private market pricing.
        </p>
        <h3>How to use this calculator</h3>
        <p>
          Enter ARR and a market multiple from comparable companies or reports. Adjust ±1x to see sensitivity. Use growth and margin fields to document context and justify the chosen multiple.
        </p>
        <h3>Why it matters</h3>
        <p>
          A clear valuation range supports fundraising, M&A conversations, option pricing, and scenario planning with stakeholders.
        </p>
        <h3>Example</h3>
        <p>
          For ARR of $1.2M and an 8× multiple, enterprise value is ~$9.6M. Sensitivity shows $8.4M at 7× and $10.8M at 9×, framing negotiation bounds.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          Multiples are market‑driven and can change rapidly. This model ignores debt, cash, and detailed DCF analysis; treat it as a quick triangulation.
        </p>
        <h3>Growth and quality factors</h3>
        <p>
          Higher growth, strong gross margin, and high NRR (e.g., 120%+) typically support higher EV/ARR multiples. Efficiency (e.g., burn multiple, Rule of 40) also influences ranges.
        </p>
        <h3>Multiples vs. DCF</h3>
        <p>
          Multiples quickly triangulate value using market comps; discounted cash flow (DCF) incorporates time value and profitability paths. Use both for a more robust view.
        </p>
        <h3>Sensitivity and ranges</h3>
        <p>
          Present ranges (e.g., 7–9×) rather than point estimates. Document assumptions on growth, margin, retention, and market conditions to contextualize where you land in the band.
        </p>
        <h3>Best practices</h3>
        <p>
          Build a comps set, adjust for your profile, check EV/ARR and EV/Revenue, and reconcile with DCF. Highlight cash and debt adjustments separately.
        </p>
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'How is SaaS valuation estimated here?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'This tool multiplies ARR by a revenue multiple and shows ±1x sensitivity.'
              }
            },
            {
              '@type': 'Question',
              name: 'What affects multiples?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Growth, gross margin, net dollar retention, profitability, efficiency, and market sentiment typically drive multiple ranges.'
              }
            },
            {
              '@type': 'Question',
              name: 'How should I pick the multiple?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use public comps and private transaction reports; adjust for your growth, margin, and retention profile and present a range.'
              }
            },
            {
              '@type': 'Question',
              name: 'Multiples vs. DCF?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Multiples are quick market-based benchmarks; DCF incorporates time value and profit trajectories. Use both for triangulation.'
              }
            },
            {
              '@type': 'Question',
              name: 'Do I adjust for cash and debt?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Enterprise value typically equals equity value plus debt minus cash; consider these adjustments when reconciling to equity value.'
              }
            }
          ]
        })}
      </script>
    </div>
  );
}