"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@feedgot/ui/components/card";
import { Input } from "@feedgot/ui/components/input";
import  BackLink  from "../global/backlink";


function parseList(csv: string): number[] {
  return csv
    .split(/[ ,\n\t]+/)
    .map((s) => s.replace(/[^0-9.-]/g, ""))
    .map((s) => parseFloat(s))
    .filter((n) => !isNaN(n));
}

function formatCurrencyExact(value: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))));
  return sorted[idx] ?? 0;
}

export default function WtpSurveyTool() {
  const [csv, setCsv] = React.useState("20,25,30,40,45,50,55,60");

  const values = parseList(csv).sort((a, b) => a - b);
  const count = values.length;
  const mean = count === 0 ? 0 : values.reduce((acc, n) => acc + n, 0) / count;
  const median = count === 0 ? 0 : values[Math.floor(count / 2)];
  const p25 = percentile(values, 25);
  const p75 = percentile(values, 75);

  return (
    <div className="space-y-6">
      <div className="prose prose-neutral dark:prose-invert">
        <h2>WTP Survey</h2>
        <p>
          Analyze willingness‑to‑pay (WTP) responses to derive pricing corridors. Paste a list of prices to see mean, median, and the interquartile range (25th–75th percentile) that suggests a robust target band.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <Card >
          <CardHeader>
            <CardTitle>WTP Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="20, 25, 30, 40, 45, 50" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card >
          <CardHeader>
            <CardTitle>Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{count}</div>
            <div className="text-sm text-muted-foreground">responses</div>
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Mean</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{formatCurrencyExact(mean)}</div>
            <div className="text-sm text-muted-foreground">average price</div>
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Median</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{formatCurrencyExact(median ?? 0)}</div>
            <div className="text-sm text-muted-foreground">middle of distribution</div>
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Recommended Band</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-1">
            <div className="text-xl font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
              {formatCurrencyExact(p25)} – {formatCurrencyExact(p75)}
            </div>
            <div className="text-sm text-muted-foreground">interquartile range</div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>Using the band</h3>
        <p>
          The interquartile range is a robust central band for pricing; test points within it against differentiated value.
        </p>
        <h3>What is WTP?</h3>
        <p>
          Willingness‑to‑pay (WTP) is the maximum price a customer is willing to pay for perceived value. Survey responses help approximate price sensitivity and inform tiering.
        </p>
        <h3>How to use this tool</h3>
        <p>
          Paste a list of WTP values (comma or space‑separated). The tool calculates mean, median, and the 25th–75th percentile band to guide target pricing.
        </p>
        <h3>Why it matters</h3>
        <p>
          WTP distribution highlights segments and pricing corridors. Pricing within the interquartile band reduces churn risk from overpricing and avoids leaving money on the table from underpricing.
        </p>
        <h3>Example</h3>
        <p>
          For responses [20, 25, 30, 40, 45, 50, 55, 60], mean is ~$40.6, median $42.5, and the recommended band ~$30–$55.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          Surveys can suffer bias. Combine WTP with observed behavior (trials, upgrades) and revisit as value evolves.
        </p>
        <h3>Methodologies</h3>
        <p>
          Van Westendorp (too cheap/cheap/expensive/too expensive), Gabor‑Granger discrete choice, and conjoint analysis help estimate WTP and sensitivity across features and price levels.
        </p>
        <h3>Sampling & bias</h3>
        <p>
          Use representative samples, avoid leading questions, and watch for outliers. Consider trimming extremes and bootstrapping to stabilize estimates.
        </p>
        <h3>From survey to pricing</h3>
        <p>
          Use the interquartile band as a corridor, then test prices against actual behavior. Segment by persona to tailor tiers and price fences.
        </p>
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What data do I input?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Comma or space-separated list of WTP survey responses in price units.'
              }
            },
            {
              '@type': 'Question',
              name: 'How is the recommended price derived?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'We summarize mean, median, and use the 25th–75th percentile band as a robust target range.'
              }
            },
            {
              '@type': 'Question',
              name: 'What is willingness to pay (WTP)?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The maximum price a customer is willing to pay for the perceived value of a product or service.'
              }
            },
            {
              '@type': 'Question',
              name: 'Van Westendorp vs. Gabor-Granger?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Van Westendorp uses four price perception questions; Gabor-Granger tests discrete price choices. Conjoint adds feature trade-offs.'
              }
            },
            {
              '@type': 'Question',
              name: 'How many responses do I need?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Aim for 100+ representative responses; more is better for stable estimates. Use bootstrapping when samples are smaller.'
              }
            }
          ]
        })}
      </script>
    </div>
  );
}