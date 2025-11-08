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

export default function PriceElasticityTool() {
  const [p0, setP0] = React.useState("20");
  const [q0, setQ0] = React.useState("1000");
  const [p1, setP1] = React.useState("25");
  const [q1, setQ1] = React.useState("800");

  const basePrice = parseNumber(p0);
  const baseQty = parseNumber(q0);
  const newPrice = parseNumber(p1);
  const newQty = parseNumber(q1);

  const priceChangePct = basePrice === 0 ? 0 : ((newPrice - basePrice) / basePrice) * 100;
  const qtyChangePct = baseQty === 0 ? 0 : ((newQty - baseQty) / baseQty) * 100;
  const elasticity = priceChangePct === 0 ? 0 : qtyChangePct / priceChangePct;

  const baselineRevenue = basePrice * baseQty;
  const newRevenue = newPrice * newQty;
  const revenueDelta = newRevenue - baselineRevenue;

  const classification = Math.abs(elasticity) > 1 ? "Elastic" : Math.abs(elasticity) === 1 ? "Unit Elastic" : "Inelastic";

  return (
    <div className="space-y-6">
      <div className="prose prose-neutral dark:prose-invert">
        <h2>Price Elasticity</h2>
        <p>
          Price elasticity measures how demand responds to price changes — calculated as % change in quantity divided by % change in price. Use this calculator to evaluate pricing tests, understand sensitivity (elastic vs. inelastic), and estimate how revenue shifts when prices move.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card >
          <CardHeader>
            <CardTitle>Baseline Price</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={p0} onChange={(e) => setP0(e.target.value)} placeholder="$20" />
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Baseline Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={q0} onChange={(e) => setQ0(e.target.value)} placeholder="1000" />
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>New Price</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={p1} onChange={(e) => setP1(e.target.value)} placeholder="$25" />
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>New Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={q1} onChange={(e) => setQ1(e.target.value)} placeholder="800" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card >
          <CardHeader>
            <CardTitle>Elasticity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{elasticity.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">{classification}</div>
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Price Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(priceChangePct)}</div>
            <div className="text-sm text-muted-foreground">vs baseline</div>
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Quantity Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(qtyChangePct)}</div>
            <div className="text-sm text-muted-foreground">vs baseline</div>
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Revenue Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(revenueDelta)}</div>
            <div className="text-sm text-muted-foreground">new vs baseline</div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>What is price elasticity?</h3>
        <p>
          Price elasticity of demand indicates how sensitive buyers are to price changes. If elasticity magnitude is greater than 1, demand is considered elastic (quantity moves more than price). If it&apos;s less than 1, demand is inelastic.
        </p>
        <h3>How to calculate</h3>
        <p>
          Compute percentage changes for price and quantity from a baseline to a new scenario, then divide quantity change by price change. For example, a {formatPct(priceChangePct)} price change and a {formatPct(qtyChangePct)} quantity change yields elasticity {elasticity.toFixed(2)}.
        </p>
        <h3>Why it matters</h3>
        <p>
          Understanding elasticity helps set prices that optimize revenue and profit by balancing margin and volume.
        </p>
        <h3>How to use this calculator</h3>
        <p>
          Enter a baseline price and quantity alongside a new price and quantity based on research or tests. The tool computes elasticity, classifies sensitivity (elastic, unit elastic, inelastic), and shows revenue impact so you can evaluate price moves.
        </p>
        <h3>Example</h3>
        <p>
          Suppose price increases from $20 to $25 (+25%) and quantity falls from 1,000 to 800 (−20%). Elasticity = −20% ÷ 25% = −0.80, indicating inelastic demand. Revenue changes from $20,000 to $20,000 — flat despite a higher price, due to lower volume.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          Elasticity often varies by segment, channel, and time. This simple point estimate uses two scenarios; real demand curves may be non‑linear and influenced by competition, substitutes, and seasonality.
        </p>
        <h3>Best practices</h3>
        <p>
          Run A/B price tests, segment customers by value, and analyze cross‑elasticity for bundles or tiers. Pair elasticity analysis with contribution margin to avoid chasing volume at the expense of profit.
        </p>
        <h3>Arc vs. point elasticity</h3>
        <p>
          Point elasticity uses two specific points; arc (midpoint) elasticity averages changes between points to reduce bias from base selection. For small changes, both are similar; for larger changes, arc is often preferred.
        </p>
        <h3>Benchmarks</h3>
        <p>
          Many B2B SaaS products exhibit inelastic demand near list price (|E| &lt; 1), especially for essential workflows. Consumer goods often show more elastic behavior, and promos can temporarily increase elasticity.
        </p>
        <h3>Revenue vs. profit</h3>
        <p>
          A price increase may raise revenue with inelastic demand, but margins and churn risk also matter. Combine elasticity with contribution margin and retention data before making large changes.
        </p>
        <h3>Pricing psychology</h3>
        <p>
          Charm pricing (e.g., $29 vs. $30), anchoring via tier ladders, and bundling can shift perceived value and effective elasticity without changing cost structure.
        </p>
        <h3>Step‑by‑step check</h3>
        <p>
          Compute %ΔP and %ΔQ, then divide to get elasticity. Classify sensitivity, compare baseline vs. new revenue, and assess profit impact before rollout.
        </p>
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is price elasticity?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Price elasticity of demand measures how quantity demanded changes in response to price changes, calculated as %ΔQ ÷ %ΔP.'
              }
            },
            {
              '@type': 'Question',
              name: 'When does increasing price raise revenue?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'If demand is inelastic (|E| < 1), moderate price increases can raise revenue. Always check margin and retention risk.'
              }
            },
            {
              '@type': 'Question',
              name: 'Arc vs. point elasticity?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Arc (midpoint) elasticity averages changes between points to reduce base bias; point elasticity uses the change relative to a single baseline.'
              }
            },
            {
              '@type': 'Question',
              name: 'How many data points do I need?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Two points provide a rough estimate; more points across different price levels help fit a demand curve and improve accuracy.'
              }
            },
            {
              '@type': 'Question',
              name: 'How do I account for seasonality?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Run tests over comparable periods and segment by channel or cohort; use time series controls for seasonal variation.'
              }
            }
          ]
        })}
      </script>
    </div>
  );
}