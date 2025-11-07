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

export default function RevenuePerEmployeeTool() {
  const [revenue, setRevenue] = React.useState("1000000");
  const [employees, setEmployees] = React.useState("25");

  const rpe = React.useMemo(() => {
    const r = parseNumber(revenue);
    const e = parseNumber(employees);
    return e > 0 ? r / e : 0;
  }, [revenue, employees]);

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Revenue per Employee</h2>
        <p>
          Revenue per employee indicates team efficiency. Formula: <code>RPE = Revenue ÷ Employees</code>. Use this calculator to benchmark revenue efficiency per teammate. Enter total revenue and the number of employees to understand productivity trends over time.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter revenue and number of employees.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="rev">Revenue</Label>
                <Input id="rev" type="text" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="emp">Employees</Label>
                <Input id="emp" type="text" value={employees} onChange={(e) => setEmployees(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="rpe">RPE</Label>
                <Input id="rpe" type="text" value={formatCurrencyExact(rpe)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Revenue efficiency per teammate.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">RPE</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(rpe)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Revenue</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(parseNumber(revenue))}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Employees</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{employees.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />

        <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6">
          <h3>What is revenue per employee (RPE)?</h3>
          <p>
            RPE measures how much revenue each team member generates on average. It’s a proxy for operational efficiency
            and can highlight productivity trends across stages of growth.
          </p>
          <h3>Why it matters</h3>
          <ul>
            <li>Helps benchmark efficiency against peers and over time.</li>
            <li>Guides hiring plans by linking headcount to revenue goals.</li>
            <li>Surfaces scale bottlenecks (support load, infra, process debt).</li>
          </ul>
          <h3>How to calculate</h3>
          <p>RPE = Total revenue ÷ Number of employees. Use an average headcount for the period to avoid skew from rapid hiring.</p>
          <h3>Example</h3>
          <p>{formatCurrencyExact(parseNumber(revenue))} revenue and {parseNumber(employees).toLocaleString()} employees ⇒ RPE {formatCurrencyExact(rpe)}.</p>
          <h3>Caveats</h3>
          <ul>
            <li>Contractors and part‑time staff can distort comparisons.</li>
            <li>Capital‑intensive or services‑heavy models have lower RPE.</li>
            <li>Pair RPE with margin metrics to avoid optimizing for revenue only.</li>
          </ul>
          <h3>FAQ</h3>
          <p><strong>What’s a good RPE?</strong> Varies widely; early SaaS may be $100k–$200k, mature companies higher.</p>
          <p><strong>Should I use FTE or total headcount?</strong> Prefer average FTEs during the period for consistency.</p>
          <p><strong>How often should I track RPE?</strong> Quarterly gives a balanced view across hiring cycles.</p>
          <script type="application/ld+json" suppressHydrationWarning>{JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is revenue per employee?","acceptedAnswer":{"@type":"Answer","text":"RPE is revenue divided by number of employees, a proxy for efficiency."}},{"@type":"Question","name":"What is a good RPE for SaaS?","acceptedAnswer":{"@type":"Answer","text":"Early SaaS may be $100k–$200k per employee; mature can be higher."}},{"@type":"Question","name":"Should I use FTEs or total headcount?","acceptedAnswer":{"@type":"Answer","text":"Use average FTEs for the period to improve comparability."}}]})}</script>
        </div>
      </div>
    </div>
  );
}