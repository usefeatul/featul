"use client";

import React from "react";
import BackLink from "@/components/tools/global/backlink";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@feedgot/ui/components/card";
import { Label } from "@feedgot/ui/components/label";
import { Input } from "@feedgot/ui/components/input";

const parseNumber = (v: string) => {
  const n = Number((v || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const formatPct = (n: number) => `${n.toFixed(1)}%`;

export default function OpexRatioTool() {
  const [opex, setOpex] = React.useState("200000");
  const [revenue, setRevenue] = React.useState("500000");

  const ratio = React.useMemo(() => {
    const o = parseNumber(opex);
    const r = parseNumber(revenue);
    return r > 0 ? (o / r) * 100 : 0;
  }, [opex, revenue]);

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Operating Expense Ratio</h2>
        <p>
          Percentage of revenue consumed by operating expenses. Formula: <code>OpEx ratio = Operating expenses ÷ Revenue</code>. Use this calculator to understand how much of revenue goes to operating expenses. Enter total operating expenses and revenue to see the ratio as a percentage.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter operating expenses and revenue.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="opex">Operating expenses</Label>
                <Input id="opex" type="text" value={opex} onChange={(e) => setOpex(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="rev">Revenue</Label>
                <Input id="rev" type="text" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ratio">OpEx ratio</Label>
                <Input id="ratio" type="text" value={formatPct(ratio)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>OpEx ratio and inputs overview.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">OpEx ratio</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatPct(ratio)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Operating expenses</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{parseNumber(opex).toLocaleString()}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Revenue</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{parseNumber(revenue).toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />

        <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6">
          <h3>What is the operating expense ratio?</h3>
          <p>
            The operating expense (OpEx) ratio shows the percentage of revenue consumed by operating expenses.
            It reflects efficiency of the cost structure relative to topline.
          </p>
          <h3>Why it matters</h3>
          <ul>
            <li>Helps compare efficiency across teams and time periods.</li>
            <li>Signals scalability: lower ratios at higher revenue are healthy.</li>
            <li>Guides budget allocation and cost optimization decisions.</li>
          </ul>
          <h3>How to calculate</h3>
          <p>OpEx ratio (%) = Operating expenses ÷ Revenue × 100.</p>
          <h3>Example</h3>
          <p>
            Operating expenses {parseNumber(opex).toLocaleString()}, Revenue {parseNumber(revenue).toLocaleString()} ⇒ OpEx ratio {formatPct(ratio)}.
          </p>
          <h3>Optimization tips</h3>
          <ul>
            <li>Prioritize spend with measurable ROI; sunset underperforming initiatives.</li>
            <li>Automate manual workflows and leverage shared platforms.</li>
            <li>Renegotiate vendor contracts and consolidate overlapping tools.</li>
          </ul>
          <h3>FAQ</h3>
          <p><strong>What is a good OpEx ratio?</strong> It varies by model and stage; trend direction and quality of spend matter most.</p>
          <p><strong>Should COGS be included?</strong> No—OpEx excludes COGS; it covers operating expenses like R&D, S&M, and G&A.</p>
          <p><strong>How does revenue scale affect the ratio?</strong> As revenue grows, the ratio should generally decline if the business is scaling efficiently.</p>
          <script type="application/ld+json" suppressHydrationWarning>{JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is a good OpEx ratio?","acceptedAnswer":{"@type":"Answer","text":"It depends on the business model and stage; focus on trend and spend quality."}},{"@type":"Question","name":"Does OpEx include COGS?","acceptedAnswer":{"@type":"Answer","text":"No. OpEx excludes COGS and includes operating expenses like R&D, Sales & Marketing, and G&A."}},{"@type":"Question","name":"How should OpEx ratio change with scale?","acceptedAnswer":{"@type":"Answer","text":"It should decline as revenue grows if the business scales efficiently."}}]})}</script>
        </div>
      </div>
    </div>
  );
}