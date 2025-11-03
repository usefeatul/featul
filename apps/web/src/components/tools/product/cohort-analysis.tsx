"use client";

import { useMemo, useState } from "react";
import BackLink from "@/components/tools/backlink";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@feedgot/ui/components/card";
import { Label } from "@feedgot/ui/components/label";
import { Input } from "@feedgot/ui/components/input";
import { Button } from "@feedgot/ui/components/button";
import { Plus, Trash } from "lucide-react";

type Cohort = {
  size: number;
  m1: number; // retention % month 1
  m2: number; // retention % month 2
  m3: number; // retention % month 3
};

export default function CohortAnalysisTool() {
  const [cohorts, setCohorts] = useState<Cohort[]>([
    { size: 120, m1: 70, m2: 55, m3: 45 },
    { size: 100, m1: 68, m2: 52, m3: 42 },
    { size: 90, m1: 72, m2: 58, m3: 47 },
  ]);

  const update = (i: number, patch: Partial<Cohort>) =>
    setCohorts((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    );

  const avgRetention = useMemo(() => {
    const count = cohorts.length || 1;
    const avg = (key: keyof Omit<Cohort, "size">) =>
      cohorts.reduce(
        (s, c) => s + (isFinite(c[key]) ? (c[key] as number) : 0),
        0
      ) / count;
    return { m1: avg("m1"), m2: avg("m2"), m3: avg("m3") };
  }, [cohorts]);

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Cohort retention analysis</h2>
        <p>
          Analyze retention by signup month. Enter cohort size and retention
          percentages for the next three months. The chart shows average
          retention across cohorts and the table provides a simple retention
          matrix.
        </p>
        <p>
          Retention rate is{" "}
          <code>(active users at period ÷ original cohort size) × 100%</code>.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="tracking-wide">
            <CardTitle className="text-base">Cohort inputs</CardTitle>
            <CardDescription>
              Add cohorts and enter the size plus retention % for M1–M3. The
              summary updates instantly.
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setCohorts((prev) => [
                    ...prev,
                    { size: 80, m1: 65, m2: 50, m3: 40 },
                  ])
                }
              >
                <Plus className="mr-1" /> Add cohort
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cohorts.map((c, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end"
                >
                  <div>
                    <Label htmlFor={`size-${i}`}>Cohort size</Label>
                    <Input
                      id={`size-${i}`}
                      type="number"
                      min={0}
                      value={isFinite(c.size) ? c.size : 0}
                      onChange={(e) =>
                        update(i, { size: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`m1-${i}`}>M1 %</Label>
                    <Input
                      id={`m1-${i}`}
                      type="number"
                      min={0}
                      max={100}
                      value={isFinite(c.m1) ? c.m1 : 0}
                      onChange={(e) =>
                        update(i, { m1: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`m2-${i}`}>M2 %</Label>
                    <Input
                      id={`m2-${i}`}
                      type="number"
                      min={0}
                      max={100}
                      value={isFinite(c.m2) ? c.m2 : 0}
                      onChange={(e) =>
                        update(i, { m2: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`m3-${i}`}>M3 %</Label>
                    <Input
                      id={`m3-${i}`}
                      type="number"
                      min={0}
                      max={100}
                      value={isFinite(c.m3) ? c.m3 : 0}
                      onChange={(e) =>
                        update(i, { m3: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="flex justify-end self-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setCohorts((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      aria-label={`Remove cohort ${i + 1}`}
                    >
                      <Trash className="mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Summary card stacked below inputs */}
        <Card>
          <CardHeader className="tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>
              Average retention across cohorts. Tiles show key aggregates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-md border p-3 text-center">
                <div className="text-xs text-zinc-500">Avg M1</div>
                <div className="mt-1 font-mono text-base tabular-nums">
                  {Math.round(avgRetention.m1)}%
                </div>
              </div>
              <div className="rounded-md border p-3 text-center">
                <div className="text-xs text-zinc-500">Avg M2</div>
                <div className="mt-1 font-mono text-base tabular-nums">
                  {Math.round(avgRetention.m2)}%
                </div>
              </div>
              <div className="rounded-md border p-3 text-center">
                <div className="text-xs text-zinc-500">Avg M3</div>
                <div className="mt-1 font-mono text-base tabular-nums">
                  {Math.round(avgRetention.m3)}%
                </div>
              </div>
              <div className="rounded-md border p-3 text-center">
                <div className="text-xs text-zinc-500">Cohorts</div>
                <div className="mt-1 font-mono text-base tabular-nums">
                  {cohorts.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>Cohort retention basics</h3>
        <p>
          Retention measures how many users from a given cohort are still active
          after a period. It is essential for validating long‑term value,
          product‑market fit, and sustainable growth.
        </p>
        <p>
          Formula:{" "}
          <code>
            retention (%) = active users at period ÷ original cohort size × 100
          </code>
          . Month 1 (M1) gives a read on activation quality; M2–M3 show whether
          users develop ongoing habits.
        </p>

        <h4>What each input means</h4>
        <ul>
          <li>
            <strong>Cohort size</strong>: Users who entered the product in that
            month.
          </li>
          <li>
            <strong>M1/M2/M3 %</strong>: Share of that cohort active in each
            subsequent month.
          </li>
        </ul>

        <h4>How to use the calculator</h4>
        <ol>
          <li>Add cohorts by month or segment you want to compare.</li>
          <li>Enter the cohort size and retention percentages for M1–M3.</li>
          <li>
            Review the summary for average retention and number of cohorts.
          </li>
          <li>
            Compare cohorts to identify where activation or long‑term value is
            weaker.
          </li>
        </ol>

        <h4>Interpreting results</h4>
        <ul>
          <li>
            Average retention today:{" "}
            <strong>{Math.round(avgRetention.m1)}%</strong> at M1,{" "}
            <strong>{Math.round(avgRetention.m2)}%</strong> at M2,{" "}
            <strong>{Math.round(avgRetention.m3)}%</strong> at M3.
          </li>
          <li>
            Large drop from M1→M2 often means users don’t build a repeat habit.
          </li>
          <li>Stable M2→M3 suggests sustained value or sticky workflows.</li>
          <li>
            Benchmark internally over time; absolute benchmarks vary widely by
            product.
          </li>
        </ul>

        <h4>Example</h4>
        <p>
          If M1 averages around {Math.round(avgRetention.m1)}% and then drops to{" "}
          {Math.round(avgRetention.m2)}% at M2, focus on reinforcing value
          moments and prompts that bring users back to the core workflow in
          weeks 2–4.
        </p>

        <h4>Common pitfalls</h4>
        <ul>
          <li>
            Mixing seasonality and growth spikes—compare like cohorts to avoid
            bias.
          </li>
          <li>
            Using logins instead of meaningful activity—define “active” as
            completing a core action.
          </li>
          <li>Small cohort sizes—aggregate or smooth to reduce noise.</li>
        </ul>

        <h4>Actions to improve retention</h4>
        <ul>
          <li>
            Map activation steps; remove friction and reduce time‑to‑value.
          </li>
          <li>
            Segment by source, plan, or persona; prioritize cohorts with the
            biggest gaps.
          </li>
          <li>
            Encourage repeat usage with timely, contextual nudges and saved
            workflows.
          </li>
        </ul>
      </section>
    </div>
  );
}
