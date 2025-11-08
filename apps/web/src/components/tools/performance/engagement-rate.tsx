"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@feedgot/ui/components/card";
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
          Measure interactions per impression to evaluate content or campaign
          engagement. Enter engagements and impressions to compute engagement
          rate and normalized counts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Engagements</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={engagements}
              onChange={(e) => setEngagements(e.target.value)}
              placeholder="3,500"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={impressions}
              onChange={(e) => setImpressions(e.target.value)}
              placeholder="100,000"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(rate)}</div>
            <div className="text-sm text-muted-foreground">
              engagements ÷ impressions
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engagements / 1k</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {engagementsPerThousand.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              per 1,000 impressions
            </div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>What is engagement rate?</h3>
        <p>
          Engagement rate is the percentage of impressions that result in an
          interaction (like, comment, click, share, etc.).
        </p>
        <h3>How to use this calculator</h3>
        <p>
          Provide total interactions and impressions for a period. The
          calculator returns engagement rate and per‑1,000 normalization.
        </p>
        <h3>Why it matters</h3>
        <p>
          High engagement signals relevance and quality, boosting organic reach
          and conversion likelihood.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          Interaction definitions vary by platform. Normalize by content type
          and audience segment for fair comparisons.
        </p>
        <h3>Formula</h3>
        <p>
          Engagement rate = Engagements ÷ Impressions × 100%. Engagements per
          1,000 impressions = Engagements ÷ Impressions × 1,000.
        </p>
        <h3>What counts as an engagement?</h3>
        <p>
          Depending on platform, engagements may include likes, comments,
          shares, clicks, saves, video plays, or dwell time. Define a consistent
          set for comparison.
        </p>
        <h3>Benchmarks</h3>
        <p>
          Typical ranges vary: organic social posts might see 0.5–2% engagement,
          paid campaigns differ by objective. Focus on relative trends within
          your audience and content type.
        </p>
        <h3>How to increase engagement</h3>
        <ul>
          <li>Write clear, audience‑specific headlines and CTAs.</li>
          <li>Use visuals and storytelling tailored to each platform.</li>
          <li>Post consistently and at optimal times for your audience.</li>
          <li>
            Encourage interaction (questions, polls) and respond to comments.
          </li>
          <li>Test formats (video, carousel) and iterate on winners.</li>
        </ul>
        <h3>Example</h3>
        <p>
          If a post receives 3,500 engagements from 100,000 impressions, rate =
          3,500 ÷ 100,000 × 100% = 3.5%. Engagements per 1k = 35.
        </p>
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How is engagement rate calculated?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Engagement rate = Engagements ÷ Impressions × 100%.",
              },
            },
            {
              "@type": "Question",
              name: "What counts as an engagement?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Interactions such as likes, comments, shares, clicks, or saves.",
              },
            },
            {
              "@type": "Question",
              name: "What is a good engagement rate?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "It varies by platform and content type; benchmark against your historical performance and audience.",
              },
            },
            {
              "@type": "Question",
              name: "How can I improve engagement?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Publish relevant content, optimize timing and CTAs, use platform‑native formats, and iterate via testing.",
              },
            },
          ],
        })}
      </script>
    </div>
  );
}
