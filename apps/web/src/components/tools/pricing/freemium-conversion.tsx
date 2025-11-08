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
        <Card >
          <CardHeader>
            <CardTitle>Monthly Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={signups} onChange={(e) => setSignups(e.target.value)} placeholder="10,000" />
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Activation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={activationPct} onChange={(e) => setActivationPct(e.target.value)} placeholder="60%" />
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Paywall Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={paywallHitPct} onChange={(e) => setPaywallHitPct(e.target.value)} placeholder="50%" />
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Purchase Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={purchasePct} onChange={(e) => setPurchasePct(e.target.value)} placeholder="5%" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card >
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(convRate * 100)}</div>
            <div className="text-sm text-muted-foreground">activation × paywall × purchase</div>
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Activated Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{activated.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Paywall Hits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{paywallHits.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">activated × paywall</div>
          </CardContent>
        </Card>
        <Card >
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
        <h3>Formula</h3>
        <p>
          Overall freemium conversion rate = <strong>activation × paywall exposure × purchase</strong>. Improving earlier stages amplifies downstream paid conversions.
        </p>
        <h3>Benchmarks</h3>
        <p>
          Activation can range 30–70% depending on onboarding quality; paywall exposure 30–60% based on gating strategy; purchase 1–8% by segment and price. Treat these as directional and test for your audience.
        </p>
        <h3>Stage optimization ideas</h3>
        <p>
          Activation: guided setup, shortcuts, templates. Paywall: value‑based gating, progressive limits, timely prompts. Purchase: contextual upsells, annual discounts, usage‑based price metrics aligned to value.
        </p>
        <h3>Common pitfalls</h3>
        <p>
          Gating too early (blocking value discovery), gating too late (low urgency), overly generic upgrade prompts, and ignoring cohort differences. Measure retention alongside conversion to avoid churn‑prone upgrades.
        </p>
        <h3>Step‑by‑step example</h3>
        <p>
          Signups S = 10,000. Activation A = 60% ⇒ 6,000 activated. Paywall exposure E = 50% ⇒ 3,000 hits. Purchase P = 5% ⇒ 150 paid conversions. Overall = A × E × P = 1.5%.
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
              name: 'What is a good freemium conversion rate?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ranges vary widely by product; many PLG products see 0.5–5% overall. Focus on improving activation first, then paywall exposure, then purchase.'
              }
            },
            {
              '@type': 'Question',
              name: 'Where should I place the paywall?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Gate high‑value moments after value discovery (e.g., limits, premium features). Avoid blocking core setup before first value.'
              }
            },
            {
              '@type': 'Question',
              name: 'Trial vs. freemium?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Trials add urgency for complex products; freemium suits habitual, self‑serve use. Many products combine both via free tier plus premium trial prompts.'
              }
            },
            {
              '@type': 'Question',
              name: 'How do I validate improvements?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use cohort analysis, randomized experiments, and track retention and upgrade quality to ensure durable gains.'
              }
            }
          ]
        })}
      </script>
    </div>
  );
}