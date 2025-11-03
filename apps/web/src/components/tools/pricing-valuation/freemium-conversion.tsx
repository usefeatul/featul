"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@feedgot/ui/components/card";
import { Input } from "@feedgot/ui/components/input";
import  BackLink  from "../backlink";


function parseNumber(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function formatPct(value: number): string {
  return `${value.toFixed(2)}%`;
}

export default function FreemiumConversionTool() {
  const [signups, setSignups] = React.useState("10000");
  const [activationPct, setActivationPct] = React.useState("60");
  const [paywallHitPct, setPaywallHitPct] = React.useState("50");
  const [purchasePct, setPurchasePct] = React.useState("5");

  const S = parseNumber(signups);
  const activation = parseNumber(activationPct) / 100;
  const paywall = parseNumber(paywallHitPct) / 100;
  const purchase = parseNumber(purchasePct) / 100;

  const convRate = activation * paywall * purchase; // fraction
  const activated = Math.round(S * activation);
  const paywallHits = Math.round(activated * paywall);
  const paidConversions = Math.round(S * convRate);

  return (
    <div className="space-y-6">
      <div className="prose prose-neutral dark:prose-invert">
        <h2>Freemium Conversion</h2>
        <p>
          Model a PLG freemium funnel from signups through activation, paywall exposure, and purchase. Enter stage rates to estimate overall conversion, activated users, paywall hits, and expected paid conversions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Monthly Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={signups} onChange={(e) => setSignups(e.target.value)} placeholder="10,000" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Activation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={activationPct} onChange={(e) => setActivationPct(e.target.value)} placeholder="60%" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Paywall Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={paywallHitPct} onChange={(e) => setPaywallHitPct(e.target.value)} placeholder="50%" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Purchase Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={purchasePct} onChange={(e) => setPurchasePct(e.target.value)} placeholder="5%" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(convRate * 100)}</div>
            <div className="text-sm text-muted-foreground">activation × paywall × purchase</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Activated Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{activated.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Paywall Hits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{paywallHits.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">activated × paywall</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Paid Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{paidConversions.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>Optimization ideas</h3>
        <p>
          Improve activation with onboarding aids, increase paywall exposure with compelling gating, and tune purchase rate with targeted upgrade prompts.
        </p>
        <h3>What is freemium conversion?</h3>
        <p>
          Freemium conversion measures the share of free users who become paying customers. It is a product‑led growth (PLG) funnel metric across activation, value discovery (paywall hits), and purchase.
        </p>
        <h3>How to use this calculator</h3>
        <p>
          Input monthly signups and the percentage that activate, encounter the paywall, and purchase. The tool multiplies stage rates to yield overall conversion and expected paid conversions.
        </p>
        <h3>Why it matters</h3>
        <p>
          Understanding where users drop helps prioritize UX, packaging, and upgrade prompts. Small improvements at the top of the funnel compound downstream.
        </p>
        <h3>Example</h3>
        <p>
          With 10,000 signups, 60% activation, 50% paywall exposure, and 5% purchase, overall conversion is 1.5% and ~150 paid conversions per month.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          Rates vary by cohort and can be correlated. Use cohort analysis and experimentation to validate assumptions.
        </p>
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'How is freemium conversion calculated?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Overall conversion equals activation × paywall exposure × purchase rate.'
              }
            },
            {
              '@type': 'Question',
              name: 'What should I optimize first?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Start with activation; improvements cascade and raise all downstream conversion counts.'
              }
            },
            {
              '@type': 'Question',
              name: 'How do I use the freemium calculator?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Enter signups and stage rates for activation, paywall exposure, and purchase. The tool outputs overall conversion and expected paid conversions.'
              }
            },
            {
              '@type': 'Question',
              name: 'What are typical limitations?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Rates vary by cohort and are often correlated; treat outputs as directional and validate with experiments.'
              }
            }
          ]
        })}
      </script>
    </div>
  );
}