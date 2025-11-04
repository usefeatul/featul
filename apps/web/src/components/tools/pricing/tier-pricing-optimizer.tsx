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

function clampShare(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export default function TierPricingOptimizerTool() {
  const [signups, setSignups] = React.useState("1000");
  const [priceBasic, setPriceBasic] = React.useState("15");
  const [shareBasic, setShareBasic] = React.useState("50");
  const [priceStd, setPriceStd] = React.useState("30");
  const [shareStd, setShareStd] = React.useState("35");
  const [pricePrem, setPricePrem] = React.useState("60");
  const [sharePrem, setSharePrem] = React.useState("15");

  const S = parseNumber(signups);
  const pB = parseNumber(priceBasic);
  const sB = clampShare(parseNumber(shareBasic)) / 100;
  const pS = parseNumber(priceStd);
  const sS = clampShare(parseNumber(shareStd)) / 100;
  const pP = parseNumber(pricePrem);
  const sP = clampShare(parseNumber(sharePrem)) / 100;

  const shareSum = sB + sS + sP;
  const normalized = shareSum === 0 ? { nB: 0, nS: 0, nP: 0 } : { nB: sB / shareSum, nS: sS / shareSum, nP: sP / shareSum };

  const weightedARPU = pB * normalized.nB + pS * normalized.nS + pP * normalized.nP;
  const monthlyRevenue = S * weightedARPU;

  return (
    <div className="space-y-6">
      <div className="prose prose-neutral dark:prose-invert">
        <h2>Tier Pricing Optimizer</h2>
        <p>
          Plan multi‑tier pricing by combining price points with expected customer mix per tier. Enter signups, tier prices, and shares to estimate weighted ARPU and monthly revenue, and explore how packaging shifts shares.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Monthly Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={signups} onChange={(e) => setSignups(e.target.value)} placeholder="1,000" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Basic Price</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={priceBasic} onChange={(e) => setPriceBasic(e.target.value)} placeholder="$15" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Basic Share</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={shareBasic} onChange={(e) => setShareBasic(e.target.value)} placeholder="50%" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Standard Price</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={priceStd} onChange={(e) => setPriceStd(e.target.value)} placeholder="$30" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Standard Share</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={shareStd} onChange={(e) => setShareStd(e.target.value)} placeholder="35%" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Premium Price</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={pricePrem} onChange={(e) => setPricePrem(e.target.value)} placeholder="$60" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Premium Share</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={sharePrem} onChange={(e) => setSharePrem(e.target.value)} placeholder="15%" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Weighted ARPU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(weightedARPU)}</div>
            <div className="text-sm text-muted-foreground">shares normalized to sum 100%</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(monthlyRevenue)}</div>
            <div className="text-sm text-muted-foreground">signups × weighted ARPU</div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>Guidance</h3>
        <p>
          Use differentiation (features, limits, support) to shift shares toward higher tiers while preserving self-selection.
        </p>
        <h3>What is tier pricing optimization?</h3>
        <p>
          Tier pricing optimization balances plan prices and customer mix to maximize revenue and capture value from higher‑willingness segments.
        </p>
        <h3>How to use this calculator</h3>
        <p>
          Enter monthly signups, three tier price points, and the expected share per tier. The tool normalizes shares, computes weighted ARPU, and estimates monthly revenue.
        </p>
        <h3>Why it matters</h3>
        <p>
          Well‑designed tiers align value to price and let customers self‑select, improving monetization without hard sell tactics.
        </p>
        <h3>Example</h3>
        <p>
          With 1,000 signups and shares 50/35/15 at $15/$30/$60, weighted ARPU is ~$26.25 and monthly revenue ~$26,250.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          Shares are estimates and can shift with packaging. Consider adding an enterprise tier or add‑ons if top segments are constrained.
        </p>
        <h3>Design principles</h3>
        <p>
          Good‑better‑best tiering, clear price fences (limits, features, SLAs), and decoy tiers can nudge selection. Keep tiers simple and value‑aligned.
        </p>
        <h3>Benchmarks</h3>
        <p>
          Many products see mixes around 50–35–15 or 60–30–10 (basic/standard/premium). Your mix should evolve with packaging and segment focus.
        </p>
        <h3>Common pitfalls</h3>
        <p>
          Overlapping tiers, confusing limits, underpriced premium plans, and excessive complexity. Monitor upgrade quality and churn across tiers.
        </p>
        <h3>Step‑by‑step check</h3>
        <p>
          Normalize shares to sum to 100%, compute weighted ARPU, and multiply by signups. Test alternative price points and feature fences to observe share shifts.
        </p>
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'How are tier shares handled?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Shares are normalized to sum to 100% so the weighted ARPU remains consistent.'
              }
            },
            {
              '@type': 'Question',
              name: 'How many tiers should I offer?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Three tiers (good‑better‑best) is a common starting point; add enterprise and/or add‑ons when segment needs diverge.'
              }
            },
            {
              '@type': 'Question',
              name: 'What is a decoy tier?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'A tier intentionally less attractive to make the middle or premium tier appear more valuable by comparison.'
              }
            },
            {
              '@type': 'Question',
              name: 'Add‑ons vs. tiers?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use tiers for core value bundles; add‑ons for specialized needs (advanced features, higher limits). Avoid overlapping benefits.'
              }
            },
            {
              '@type': 'Question',
              name: 'Should I grandfather existing customers?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Grandfathering reduces churn during price changes; offer upgrade paths with clear added value for new prices.'
              }
            }
          ]
        })}
      </script>
    </div>
  );
}