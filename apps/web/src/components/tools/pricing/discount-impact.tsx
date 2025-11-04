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

export default function DiscountImpactTool() {
  const [basePrice, setBasePrice] = React.useState("30");
  const [baselineConvPct, setBaselineConvPct] = React.useState("4");
  const [discountPct, setDiscountPct] = React.useState("20");
  const [upliftPct, setUpliftPct] = React.useState("25");

  const price = parseNumber(basePrice);
  const conv = parseNumber(baselineConvPct) / 100;
  const discount = parseNumber(discountPct) / 100;
  const uplift = parseNumber(upliftPct) / 100;

  const discountedPrice = price * (1 - discount);
  const newConv = conv * (1 + uplift);
  const baselineRevPerThousand = price * conv * 1000;
  const newRevPerThousand = discountedPrice * newConv * 1000;
  const deltaPerThousand = newRevPerThousand - baselineRevPerThousand;

  return (
    <div className="space-y-6">
      <div className="prose prose-neutral dark:prose-invert">
        <h2>Discount Impact</h2>
        <p>
          Evaluate how price promotions affect revenue by modeling discount percentage and conversion uplift. Provide base price and conversion to compare new price, expected conversion, and revenue change per 1,000 visitors.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Base Price</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="$30" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Baseline Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={baselineConvPct} onChange={(e) => setBaselineConvPct(e.target.value)} placeholder="4%" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} placeholder="20%" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Conversion Uplift</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={upliftPct} onChange={(e) => setUpliftPct(e.target.value)} placeholder="25%" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>New Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(discountedPrice)}</div>
            <div className="text-sm text-muted-foreground">after discount</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>New Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(newConv * 100)}</div>
            <div className="text-sm text-muted-foreground">with uplift</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Baseline Rev / 1k</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(baselineRevPerThousand)}</div>
            <div className="text-sm text-muted-foreground">per 1,000 visitors</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>New Rev / 1k</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(newRevPerThousand)}</div>
            <div className="text-sm text-muted-foreground">per 1,000 visitors</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Revenue Δ / 1k</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(deltaPerThousand)}</div>
            <div className="text-sm text-muted-foreground">new − baseline</div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>Notes</h3>
        <p>
          Conversion lift varies by audience and offer. Use experiments to calibrate uplift inputs.
        </p>
        <h3>What is discount impact?</h3>
        <p>
          Discount impact models how price promotions affect conversion and revenue. It balances lower price against higher conversion to determine net effect.
        </p>
        <h3>How to use this calculator</h3>
        <p>
          Provide base price, baseline conversion, the discount percentage, and expected conversion uplift. The tool returns new price, new conversion, and revenue per 1,000 visitors to compare scenarios.
        </p>
        <h3>Why promotions matter</h3>
        <p>
          Well‑timed offers unlock hesitant buyers without permanently eroding perceived value. Use sparingly and test for seasonality and audience fit.
        </p>
        <h3>Example</h3>
        <p>
          A 20% discount on $30 reduces price to $24. If conversion rises from 4% to 5% (25% uplift), revenue per 1,000 visitors moves from $1,200 to $1,200 — unchanged — showing the importance of measuring lift.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          Uplift estimates are context‑dependent. Watch for fatigue, anchoring to sale prices, and cannibalization of full‑price purchases.
        </p>
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'How do discounts affect revenue?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Discounts lower price but may raise conversion; the net effect depends on uplift magnitude.'
              }
            },
            {
              '@type': 'Question',
              name: 'What baseline should I use?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use typical price and conversion for your audience; test for seasonality.'
              }
            },
            {
              '@type': 'Question',
              name: 'How do I use the discount impact calculator?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Input base price and conversion with discount percentage and expected uplift to compute new revenue per 1,000 visitors.'
              }
            },
            {
              '@type': 'Question',
              name: 'What are common pitfalls of promotions?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Overuse can anchor buyers to sale prices, reduce perceived value, and cannibalize full-price purchases.'
              }
            }
          ]
        })}
      </script>
    </div>
  );
}