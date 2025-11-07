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

const formatCurrencyExact = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const formatPct = (n: number) => `${n.toFixed(1)}%`;

export default function GrossMarginTool() {
  const [revenue, setRevenue] = React.useState("500000");
  const [cogs, setCogs] = React.useState("200000");

  const grossProfit = React.useMemo(() => {
    const r = parseNumber(revenue);
    const c = parseNumber(cogs);
    return Math.max(r - c, 0);
  }, [revenue, cogs]);

  const grossMargin = React.useMemo(() => {
    const r = parseNumber(revenue);
    return r > 0 ? (grossProfit / r) * 100 : 0;
  }, [revenue, grossProfit]);

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Gross Margin</h2>
        <p>
          Gross margin measures profitability after COGS. Formula: <code>Gross margin = (Revenue − COGS) ÷ Revenue</code>. Use this calculator to assess product profitability before operating expenses. Provide revenue and COGS to see gross profit and margin, helpful for pricing and unit economics decisions.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter revenue and cost of goods sold (COGS).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="revenue">Revenue</Label>
                <Input id="revenue" type="text" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cogs">COGS</Label>
                <Input id="cogs" type="text" value={cogs} onChange={(e) => setCogs(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="gm">Gross margin</Label>
                <Input id="gm" type="text" value={formatPct(grossMargin)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Gross profit and margin.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Gross profit</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(grossProfit)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Gross margin</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatPct(grossMargin)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />

        <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6">
          <h3>What is gross margin?</h3>
          <p>
            Gross margin shows how much of each revenue dollar remains after paying direct costs of delivery (COGS).
            It reflects pricing power and unit economics before operating expenses.
          </p>
          <h3>Why it matters</h3>
          <ul>
            <li>Indicates product profitability and scalability potential.</li>
            <li>Higher margins provide more room for sales, marketing, and R&D.</li>
            <li>Investors often benchmark SaaS gross margins at 70–85%.</li>
          </ul>
          <h3>How to calculate</h3>
          <p>Gross margin (%) = (Revenue − COGS) ÷ Revenue × 100. COGS should include hosting, third‑party delivery, support tied to usage, and payment fees.</p>
          <h3>Example</h3>
          <p>Revenue {formatCurrencyExact(parseNumber(revenue))}, COGS {formatCurrencyExact(parseNumber(cogs))} ⇒ Gross profit {formatCurrencyExact(grossProfit)}, margin {formatPct(grossMargin)}.</p>
          <h3>Common pitfalls</h3>
          <ul>
            <li>Excluding variable support or cloud costs from COGS inflates margin.</li>
            <li>Mixing services revenue with software revenue can skew margins.</li>
            <li>Not segmenting by plan or product hides margin differences.</li>
          </ul>
          <h3>FAQ</h3>
          <p><strong>What’s a good SaaS gross margin?</strong> 70–85% is typical for mature SaaS; infra‑heavy platforms may be lower.</p>
          <p><strong>Does customer support belong in COGS?</strong> If it scales directly with product delivery, include an appropriate share.</p>
          <p><strong>How does discounting affect margin?</strong> Discounts reduce revenue and therefore margin; track discount impact separately.</p>
          <script type="application/ld+json" suppressHydrationWarning>{JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is gross margin?","acceptedAnswer":{"@type":"Answer","text":"Gross margin is the percent of revenue left after COGS."}},{"@type":"Question","name":"What is a good gross margin for SaaS?","acceptedAnswer":{"@type":"Answer","text":"70–85% for mature SaaS, lower for infra‑heavy products."}},{"@type":"Question","name":"Should support be included in COGS?","acceptedAnswer":{"@type":"Answer","text":"Include costs tied directly to product delivery and usage."}}]})}</script>
        </div>
      </div>
    </div>
  );
}