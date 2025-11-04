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

function pValueTwoTailedZ(z: number): number {
  // Approximate two-tailed p-value using error function complement.
  const absZ = Math.abs(z);
  // Using Abramowitz-Stegun approximation for normal CDF tail
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989423 * Math.exp(-absZ * absZ / 2);
  const pTail = d * (((1.330274429 * t - 1.821255978) * t + 1.781477937) * t - 0.356563782) * t + 0.31938153 * d * t;
  const oneSided = Math.max(0, Math.min(1, pTail));
  return Math.max(0, Math.min(1, 2 * oneSided));
}

export default function AbTestSignificanceTool() {
  const [visitorsA, setVisitorsA] = React.useState("20000");
  const [conversionsA, setConversionsA] = React.useState("500");
  const [visitorsB, setVisitorsB] = React.useState("20000");
  const [conversionsB, setConversionsB] = React.useState("600");
  const [alphaPct, setAlphaPct] = React.useState("5");

  const nA = parseNumber(visitorsA);
  const cA = parseNumber(conversionsA);
  const nB = parseNumber(visitorsB);
  const cB = parseNumber(conversionsB);
  const alpha = parseNumber(alphaPct) / 100;

  const pA = nA === 0 ? 0 : cA / nA;
  const pB = nB === 0 ? 0 : cB / nB;
  const pPool = (cA + cB) / Math.max(1, nA + nB);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / Math.max(1, nA) + 1 / Math.max(1, nB)));
  const z = se === 0 ? 0 : (pB - pA) / se;
  const pVal = pValueTwoTailedZ(z);
  const significant = pVal < alpha;

  const absLift = (pB - pA) * 100;
  const relLift = pA === 0 ? 0 : ((pB - pA) / pA) * 100;

  return (
    <div className="space-y-6">
      <div className="prose prose-neutral dark:prose-invert">
        <h2>A/B Significance</h2>
        <p>
          Test statistical significance between two conversion rates using a two‑proportion z‑test. Enter visitors and conversions for A and B, along with the alpha threshold.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Visitors A</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={visitorsA} onChange={(e) => setVisitorsA(e.target.value)} placeholder="20,000" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Conversions A</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={conversionsA} onChange={(e) => setConversionsA(e.target.value)} placeholder="500" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Visitors B</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={visitorsB} onChange={(e) => setVisitorsB(e.target.value)} placeholder="20,000" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Conversions B</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={conversionsB} onChange={(e) => setConversionsB(e.target.value)} placeholder="600" />
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Alpha</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={alphaPct} onChange={(e) => setAlphaPct(e.target.value)} placeholder="5%" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>CR A</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(pA * 100)}</div>
            <div className="text-sm text-muted-foreground">conversions ÷ visitors</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>CR B</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(pB * 100)}</div>
            <div className="text-sm text-muted-foreground">conversions ÷ visitors</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Abs Lift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(absLift)}</div>
            <div className="text-sm text-muted-foreground">B − A (pp)</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Rel Lift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(relLift)}</div>
            <div className="text-sm text-muted-foreground">(B − A) ÷ A</div>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>p‑value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{pVal.toFixed(4)}</div>
            <div className="text-sm text-muted-foreground">two‑tailed</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Significant?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{significant ? "Yes" : "No"}</div>
            <div className="text-sm text-muted-foreground">alpha = {(alpha * 100).toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      <BackLink />

      <div className="prose prose-neutral dark:prose-invert">
        <h3>What is A/B significance?</h3>
        <p>
          Significance tests estimate the likelihood observed differences are due to chance. A two‑proportion z‑test compares conversion rates between variants.
        </p>
        <h3>How to use this calculator</h3>
        <p>
          Provide visitors and conversions for A and B, and choose an alpha (commonly 5%). The tool returns conversion rates, lifts, p‑value, and significance.
        </p>
        <h3>Why it matters</h3>
        <p>
          Significance guards against false positives from random noise, helping you ship changes that truly improve outcomes.
        </p>
        <h3>Assumptions & limitations</h3>
        <p>
          Assumes independent samples and sufficient size. For rare events or small samples, consider exact tests or Bayesian approaches.
        </p>
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'How do I test A/B significance?', acceptedAnswer: { '@type': 'Answer', text: 'Use a two‑proportion z‑test to compare conversion rates and compute a p‑value.' } },
            { '@type': 'Question', name: 'What alpha should I use?', acceptedAnswer: { '@type': 'Answer', text: 'Commonly 5% (0.05). Lower alpha reduces false positives but requires larger samples.' } },
          ],
        })}
      </script>
    </div>
  );
}