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

function formatPct(value: number): string {
  return `${value.toFixed(2)}%`;
}

export default function ConversionRateCalculatorTool() {
  const [visitors, setVisitors] = React.useState("100000");
  const [conversions, setConversions] = React.useState("2500");

  const v = parseNumber(visitors);
  const c = parseNumber(conversions);
  const rate = v === 0 ? 0 : (c / v) * 100;
  const convPerThousand = v === 0 ? 0 : (c / v) * 1000;
  const nonConversions = Math.max(0, v - c);

  return (
    <div className="space-y-6">
      <div className="prose prose-neutral dark:prose-invert">
        <h2>Conversion Rate</h2>
        <p>
          Measure conversion rate by dividing conversions by visitors. Enter total visitors and conversions to get rate, conversions per 1,000, and drop‑offs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={visitors} onChange={(e) => setVisitors(e.target.value)} placeholder="100,000" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={conversions} onChange={(e) => setConversions(e.target.value)} placeholder="2,500" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(rate)}</div>
            <div className="text-sm text-muted-foreground">conversions ÷ visitors</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Conversions / 1k</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{convPerThousand.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">per 1,000 visitors</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Non‑conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{nonConversions.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">drop‑offs</div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>What is conversion rate?</h3>
        <p>
          Conversion rate is the share of visitors that complete a desired action (purchase, signup, download, etc.).
        </p>
        <h3>How to use this calculator</h3>
        <p>
          Provide total visitors and conversions over a period. The tool computes the conversion rate and handy normalization metrics.
        </p>
        <h3>Why it matters</h3>
        <p>
          Conversion rate highlights friction and value alignment. Improving it increases ROI without more traffic.
        </p>
        <h3>Example</h3>
        <p>
          100k visitors and 2.5k conversions → 2.5% conversion rate, 25 conversions per 1,000 visitors.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          Rates vary by segment and intent. Use cohort breakdowns and avoid mixing branded and generic traffic.
        </p>
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'How is conversion rate calculated?', acceptedAnswer: { '@type': 'Answer', text: 'Conversion rate = Conversions ÷ Visitors × 100%.' } },
            { '@type': 'Question', name: 'What affects conversion rate?', acceptedAnswer: { '@type': 'Answer', text: 'Traffic quality, UX friction, value communication, and pricing.' } },
          ],
        })}
      </script>
    </div>
  );
}