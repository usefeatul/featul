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
        <Card>
          <CardHeader>
            <CardTitle>Base Price</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="$30" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Baseline Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={baselineConvPct} onChange={(e) => setBaselineConvPct(e.target.value)} placeholder="4%" />
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} placeholder="20%" />
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Conversion Uplift</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={upliftPct} onChange={(e) => setUpliftPct(e.target.value)} placeholder="25%" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card >
          <CardHeader>
            <CardTitle>New Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(discountedPrice)}</div>
            <div className="text-sm text-muted-foreground">after discount</div>
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>New Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(newConv * 100)}</div>
            <div className="text-sm text-muted-foreground">with uplift</div>
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Baseline Rev / 1k</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyExact(baselineRevPerThousand)}</div>
            <div className="text-sm text-muted-foreground">per 1,000 visitors</div>
          </CardContent>
        </Card>
        <Card >
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
        <Card >
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
        <h3>Formula</h3>
        <p>
          Baseline revenue per visitor is <strong>P × C</strong>, where P is price and C is conversion rate. After a discount <strong>d</strong> and conversion uplift <strong>u</strong>, revenue becomes <strong>P × (1 − d) × C × (1 + u)</strong>.
        </p>
        <h3>Break‑even uplift</h3>
        <p>
          To break even, set new revenue ≥ baseline: (1 − d)(1 + u) ≥ 1 ⇒ 1 + u ≥ 1 ÷ (1 − d) ⇒ <strong>u ≥ d ÷ (1 − d)</strong>. For a 20% discount, the required uplift is 25%.
        </p>
        <h3>Margin considerations</h3>
        <p>
          Discounts reduce unit margin. If variable cost is meaningful, pair this analysis with contribution margin to ensure promotions don’t drive high‑volume, low‑profit outcomes.
        </p>
        <h3>Benchmarks & scenarios</h3>
        <p>
          Small time‑boxed discounts (5–15%) often yield modest uplift in low‑ticket B2C. In B2B SaaS, discounts are typically used for annual prepay or multi‑seat deals rather than public promos; measure incrementality and guard against price anchoring.
        </p>
        <h3>Common pitfalls</h3>
        <p>
          Overusing discounts, stacking coupons, confusing terms (net vs. gross), and ignoring cannibalization from pulling forward demand can misstate true impact.
        </p>
        <h3>Step‑by‑step example</h3>
        <p>
          Baseline: P = $30, C = 4% ⇒ $1.20 per visitor. Promo: d = 20% ⇒ price $24; uplift u = 25% ⇒ conversion 5%. New revenue = $24 × 5% = $1.20. Break‑even condition holds (u = 25% = d ÷ (1 − d)).
        </p>
        <h3>Best practices</h3>
        <p>
          Use discount ladders for targeted segments, time‑box promotions, set floor prices, and monitor net lift via A/B testing. Consider value‑based incentives (add‑ons, extended trials) to avoid brand erosion.
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
                text: 'Discounts lower price but may raise conversion; the net effect depends on uplift magnitude and margin.'
              }
            },
            {
              '@type': 'Question',
              name: 'What conversion uplift is needed to break even?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Break-even uplift u satisfies (1−d)(1+u) ≥ 1, so u ≥ d/(1−d). For a 20% discount, uplift must be at least 25%.'
              }
            },
            {
              '@type': 'Question',
              name: 'How should I set baselines for analysis?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use typical price and conversion for the same audience and season; validate via A/B tests where possible.'
              }
            },
            {
              '@type': 'Question',
              name: 'Do discounts hurt margins?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, discounts reduce unit margin. Pair this with contribution margin analysis to ensure promotions remain profitable.'
              }
            },
            {
              '@type': 'Question',
              name: 'Should I stack coupons or run continuous promos?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Avoid continual discounting and stacking; it anchors perceived value to sale prices and can cannibalize full-price purchases.'
              }
            },
            {
              '@type': 'Question',
              name: 'How do I measure true uplift?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use randomized A/B tests, segment analysis, and consider pull-forward demand to isolate incremental conversions.'
              }
            }
          ]
        })}
      </script>
    </div>
  );
}