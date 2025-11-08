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

export default function BreakEvenTool() {
  const [price, setPrice] = React.useState("25");
  const [variableCost, setVariableCost] = React.useState("10");
  const [fixedCosts, setFixedCosts] = React.useState("100000");

  const marginPerUnit = React.useMemo(() => {
    return Math.max(parseNumber(price) - parseNumber(variableCost), 0);
  }, [price, variableCost]);

  const breakEvenUnits = React.useMemo(() => {
    const m = marginPerUnit;
    if (m <= 0) return 0;
    return parseNumber(fixedCosts) / m;
  }, [fixedCosts, marginPerUnit]);

  const breakEvenRevenue = React.useMemo(() => {
    return breakEvenUnits * parseNumber(price);
  }, [breakEvenUnits, price]);

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Break-even Analysis</h2>
        <p>
          Units and revenue needed to break even. Formulas: <code>Margin per unit = Price − Variable cost</code>; <code>Break-even units = Fixed costs ÷ Margin per unit</code>. Use this calculator to find the sales volume or revenue required to cover fixed and variable costs. Enter price, variable cost per unit, and fixed costs.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter price, variable cost and fixed costs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="price">Price per unit</Label>
                <Input id="price" type="text" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="variable">Variable cost per unit</Label>
                <Input id="variable" type="text" value={variableCost} onChange={(e) => setVariableCost(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fixed">Fixed costs</Label>
                <Input id="fixed" type="text" value={fixedCosts} onChange={(e) => setFixedCosts(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="margin">Margin per unit</Label>
                <Input id="margin" type="text" value={formatCurrencyExact(marginPerUnit)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Break-even metrics overview.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Margin per unit</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(marginPerUnit)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Break-even units</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{breakEvenUnits.toFixed(0)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Break-even revenue</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(breakEvenRevenue)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />

        <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6">
          <h3>What is break-even?</h3>
          <p>
            Break-even is the point where total revenue equals total costs, and profit is zero.
            It tells you how many units (or how much revenue) you need to cover fixed and variable costs.
          </p>
          <h3>Why it matters</h3>
          <ul>
            <li>Sets a baseline sales target for viability.</li>
            <li>Helps with pricing and cost structure decisions.</li>
            <li>Supports scenario planning for new products and channels.</li>
          </ul>
          <h3>How to calculate</h3>
          <p>
            Margin per unit = Price − Variable cost. Break-even units = Fixed costs ÷ Margin per unit. Break-even revenue = Break-even units × Price.
          </p>
          <h3>Example</h3>
          <p>
            Price {formatCurrencyExact(parseNumber(price))}, Variable cost {formatCurrencyExact(parseNumber(variableCost))}, Fixed costs {formatCurrencyExact(parseNumber(fixedCosts))} ⇒ Margin per unit {formatCurrencyExact(marginPerUnit)}, Break-even units {breakEvenUnits.toFixed(0)}, Break-even revenue {formatCurrencyExact(breakEvenRevenue)}.
          </p>
          <h3>Improvement ideas</h3>
          <ul>
            <li>Increase price or reduce discounts to raise unit margin.</li>
            <li>Lower variable costs through vendor negotiation or process improvements.</li>
            <li>Spread fixed costs across more volume by bundling or upsell.</li>
          </ul>
          <h3>FAQ</h3>
          <p><strong>Is break-even the same as payback?</strong> No—break-even looks at units and revenue; payback focuses on recovering CAC via gross profit.</p>
          <p><strong>Which costs count as fixed?</strong> Costs that don’t vary with units in the short term (e.g., salaries, rent).</p>
          <p><strong>Can break-even change over time?</strong> Yes—pricing, cost structure, and volume mix shift margins and fixed costs.</p>
        </div>
      </div>
    </div>
  );
}