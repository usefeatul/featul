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

export default function EngagementRateTool() {
  const [engagements, setEngagements] = React.useState("3500");
  const [impressions, setImpressions] = React.useState("100000");

  const e = parseNumber(engagements);
  const i = parseNumber(impressions);
  const rate = i === 0 ? 0 : (e / i) * 100;
  const engagementsPerThousand = i === 0 ? 0 : (e / i) * 1000;

  return (
    <div className="space-y-6">
      <div className="prose prose-neutral dark:prose-invert">
        <h2>Engagement Rate</h2>
        <p>
          Measure interactions per impression to evaluate content or campaign engagement. Enter engagements and impressions to compute engagement rate and normalized counts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Engagements</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={engagements} onChange={(e) => setEngagements(e.target.value)} placeholder="3,500" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={impressions} onChange={(e) => setImpressions(e.target.value)} placeholder="100,000" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(rate)}</div>
            <div className="text-sm text-muted-foreground">engagements ÷ impressions</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Engagements / 1k</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{engagementsPerThousand.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">per 1,000 impressions</div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>What is engagement rate?</h3>
        <p>
          Engagement rate is the percentage of impressions that result in an interaction (like, comment, click, share, etc.).
        </p>
        <h3>How to use this calculator</h3>
        <p>
          Provide total interactions and impressions for a period. The calculator returns engagement rate and per‑1,000 normalization.
        </p>
        <h3>Why it matters</h3>
        <p>
          High engagement signals relevance and quality, boosting organic reach and conversion likelihood.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          Interaction definitions vary by platform. Normalize by content type and audience segment for fair comparisons.
        </p>
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'How is engagement rate calculated?', acceptedAnswer: { '@type': 'Answer', text: 'Engagement rate = Engagements ÷ Impressions × 100%.' } },
            { '@type': 'Question', name: 'What counts as an engagement?', acceptedAnswer: { '@type': 'Answer', text: 'Interactions such as likes, comments, shares, clicks, or saves.' } },
          ],
        })}
      </script>
    </div>
  );
}