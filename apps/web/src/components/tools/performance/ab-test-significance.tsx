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
        <Card>
          <CardHeader>
            <CardTitle>Visitors A</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={visitorsA} onChange={(e) => setVisitorsA(e.target.value)} placeholder="20,000" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversions A</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={conversionsA} onChange={(e) => setConversionsA(e.target.value)} placeholder="500" />
          </CardContent>  
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Visitors B</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={visitorsB} onChange={(e) => setVisitorsB(e.target.value)} placeholder="20,000" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversions B</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={conversionsB} onChange={(e) => setConversionsB(e.target.value)} placeholder="600" />
          </CardContent>
        </Card>
        <Card>    
          <CardHeader>
            <CardTitle>Alpha</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={alphaPct} onChange={(e) => setAlphaPct(e.target.value)} placeholder="5%" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card >
          <CardHeader>
            <CardTitle>CR A</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(pA * 100)}</div>
            <div className="text-sm text-muted-foreground">conversions ÷ visitors</div>
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>CR B</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(pB * 100)}</div>
            <div className="text-sm text-muted-foreground">conversions ÷ visitors</div>
          </CardContent>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle>Abs Lift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(absLift)}</div>
            <div className="text-sm text-muted-foreground">B − A (pp)</div>
          </CardContent>
        </Card>
        <Card >   
          <CardHeader>
            <CardTitle>Rel Lift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatPct(relLift)}</div>
            <div className="text-sm text-muted-foreground">(B − A) ÷ A</div>
          </CardContent>
        </Card>
        <Card>
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
        <Card>
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
        <h3>Formula and interpretation</h3>
        <p>
          Let CR<sub>A</sub> = conversions<sub>A</sub> ÷ visitors<sub>A</sub>, CR<sub>B</sub> = conversions<sub>B</sub> ÷ visitors<sub>B</sub>. The pooled rate is p = (conversions<sub>A</sub> + conversions<sub>B</sub>) ÷ (visitors<sub>A</sub> + visitors<sub>B</sub>). The standard error is SE = √( p(1 − p) (1/visitors<sub>A</sub> + 1/visitors<sub>B</sub>) ). The test statistic is z = (CR<sub>B</sub> − CR<sub>A</sub>) ÷ SE. The two‑tailed p‑value evaluates the probability of observing a difference as extreme under the null (no true difference).
        </p>
        <h3>Sample size, power, and MDE</h3>
        <p>
          Statistical power is the probability of detecting a true effect. Larger samples increase power and reduce the minimum detectable effect (MDE). Define a practical lift you care about, pick α (e.g., 5%) and desired power (e.g., 80%), then estimate the required sample size. Avoid underpowered tests that frequently yield inconclusive results.
        </p>
        <h3>One‑tailed vs two‑tailed tests</h3>
        <p>
          Two‑tailed tests detect differences in either direction and are appropriate when you simply check for change. One‑tailed tests can be used when you only care about improvements, but they must be pre‑registered and not changed mid‑test to avoid bias.
        </p>
        <h3>Peeking and multiple comparisons</h3>
        <p>
          Repeatedly checking significance early (“peeking”) inflates false positives. Use fixed horizons or sequential methods. When testing many variants or metrics, apply corrections (e.g., Bonferroni, Benjamini‑Hochberg) or control the false discovery rate.
        </p>
        <h3>Step‑by‑step example</h3>
        <p>
          With A = 500 conversions / 20,000 visitors (2.50%) and B = 600 / 20,000 (3.00%), absolute lift is +0.50 percentage points, relative lift is +20%. The z‑test computes a p‑value; if p &lt; 0.05, we call the result statistically significant.
        </p>
        <h3>Best practices</h3>
        <ul>
          <li>Define success metrics and stopping rules before launching tests.</li>
          <li>Segment by traffic source and device to check consistency.</li>
          <li>Run long enough to cover typical weekly seasonality.</li>
          <li>Focus on practical significance (impact, cost) alongside p‑values.</li>
          <li>Validate winners with follow‑up experiments or rollout monitoring.</li>
        </ul>
      </div>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'How do I test A/B significance?', acceptedAnswer: { '@type': 'Answer', text: 'Use a two‑proportion z‑test to compare conversion rates and compute a p‑value.' } },
            { '@type': 'Question', name: 'What alpha should I use?', acceptedAnswer: { '@type': 'Answer', text: 'Commonly 5% (0.05). Lower alpha reduces false positives but requires larger samples.' } },
            { '@type': 'Question', name: 'What is a p‑value?', acceptedAnswer: { '@type': 'Answer', text: 'The p‑value is the probability of observing a result as extreme as your data if there were no true effect.' } },
            { '@type': 'Question', name: 'How long should I run an A/B test?', acceptedAnswer: { '@type': 'Answer', text: 'Run until you reach the pre‑computed sample size and cover typical seasonality; avoid peeking at results early.' } },
            { '@type': 'Question', name: 'What is the difference between statistical and practical significance?', acceptedAnswer: { '@type': 'Answer', text: 'Statistical significance reduces the chance the result is due to noise; practical significance considers magnitude, cost, and business impact.' } },
          ],
        })}
      </script>
    </div>
  );
}