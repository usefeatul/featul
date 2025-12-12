"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@oreilla/ui/components/card";
import { Input } from "@oreilla/ui/components/input";
import BackLink from "../global/backlink";

function parseNumber(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function formatPct(value: number): string {
  return `${value.toFixed(2)}%`;
}

export default function FunnelConversionTool() {
  const [top, setTop] = React.useState("50000");
  const [rate1, setRate1] = React.useState("40");
  const [rate2, setRate2] = React.useState("25");
  const [rate3, setRate3] = React.useState("10");

  const T = parseNumber(top);
  const r1 = parseNumber(rate1) / 100;
  const r2 = parseNumber(rate2) / 100;
  const r3 = parseNumber(rate3) / 100;

  const stage1 = Math.round(T * r1);
  const stage2 = Math.round(stage1 * r2);
  const stage3 = Math.round(stage2 * r3);
  const overallRate = T === 0 ? 0 : (stage3 / T) * 100;

  return (
    <div className="space-y-6">
      <div className="prose prose-neutral dark:prose-invert">
        <h2>Funnel Conversion</h2>
        <p>
          Model a multi‑stage funnel with three step rates to estimate overall conversion and counts at each stage. Enter top‑of‑funnel volume and stage rates.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Top of Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={top} onChange={(e) => setTop(e.target.value)} placeholder="50,000" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Step 1 Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={rate1} onChange={(e) => setRate1(e.target.value)} placeholder="40%" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Step 2 Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={rate2} onChange={(e) => setRate2(e.target.value)} placeholder="25%" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Step 3 Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={rate3} onChange={(e) => setRate3(e.target.value)} placeholder="10%" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Stage 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stage1.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">after step 1</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stage 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stage2.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">after step 2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stage 3 (Converted)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stage3.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">final conversions</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overall Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(overallRate)}</div>
            <div className="text-sm text-muted-foreground">converted ÷ top of funnel</div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>What is funnel conversion?</h3>
        <p>
          Funnel conversion tracks progression through stages (e.g., visit → signup → activate → purchase) to quantify drop‑offs and total conversions.
        </p>
        <h3>How to use this calculator</h3>
        <p>
          Provide top‑of‑funnel volume and three step rates. The calculator produces stage counts and overall conversion rate.
        </p>
        <h3>Why it matters</h3>
        <p>
          Identifying the leakiest stage helps prioritize UX and messaging improvements where they will have the biggest impact.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          Stages can be correlated and vary by cohort. Use event tracking and experimentation to validate improvements.
        </p>
        <h3>Formula</h3>
        <p>
          Stage 1 = Top × Rate<sub>1</sub>; Stage 2 = Stage 1 × Rate<sub>2</sub>; Stage 3 = Stage 2 × Rate<sub>3</sub>. Overall conversion = Stage 3 ÷ Top × 100%.
        </p>
        <h3>Drop‑off analysis</h3>
        <p>
          Compute drop‑off at each stage to locate bottlenecks. Pair with qualitative insights (session replays, surveys) and test hypotheses to reduce friction.
        </p>
        <h3>Benchmarks</h3>
        <p>
          Benchmarks depend on product, pricing, and audience. Activation and purchase rates often vary widely; use cohort and segment analysis to define realistic targets.
        </p>
        <h3>Improve each stage</h3>
        <ul>
          <li>Top → Signup: align value proposition, simplify forms, reduce load times.</li>
          <li>Signup → Activate: guide onboarding, highlight aha moments, nudge via emails.</li>
          <li>Activate → Purchase: clarify pricing, social proof, trial extensions, sales assists.</li>
        </ul>
        <h3>Example</h3>
        <p>
          With Top = 50,000, rates 40% → 25% → 10%: Stage 1 = 20,000, Stage 2 = 5,000, Stage 3 = 500. Overall conversion = 500 ÷ 50,000 × 100% = 1%.
        </p>
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'How is overall conversion calculated?', acceptedAnswer: { '@type': 'Answer', text: 'Multiply each stage rate and apply to top‑of‑funnel volume to get final conversions and overall rate.' } },
            { '@type': 'Question', name: 'Which stage should I optimize?', acceptedAnswer: { '@type': 'Answer', text: 'Start with the largest drop‑off and test improvements with clear metrics and segment breakdowns.' } },
            { '@type': 'Question', name: 'What is a funnel?', acceptedAnswer: { '@type': 'Answer', text: 'A funnel models sequential user steps (e.g., visit, signup, activate, purchase) to measure progression and drop‑offs.' } },
            { '@type': 'Question', name: 'How do cohorts help funnel analysis?', acceptedAnswer: { '@type': 'Answer', text: 'Cohorts group users by shared traits or start times, revealing stage differences and guiding targeted improvements.' } },
          ],
        })}
      </script>
    </div>
  );
}