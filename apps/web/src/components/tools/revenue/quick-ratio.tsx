"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"

function getQuickRatioLabel(ratio: number): { label: string; color: string; description: string } {
    if (ratio >= 4) return { label: "Excellent", color: "text-green-600 dark:text-green-400", description: "Strong growth efficiency" }
    if (ratio >= 2) return { label: "Good", color: "text-blue-600 dark:text-blue-400", description: "Healthy SaaS growth" }
    if (ratio >= 1) return { label: "Fair", color: "text-yellow-600 dark:text-yellow-400", description: "Growth but at risk" }
    return { label: "Poor", color: "text-red-600 dark:text-red-400", description: "Losing more than gaining" }
}

export default function QuickRatioTool() {
    const [newMrr, setNewMrr] = useState<string>("50000")
    const [expansionMrr, setExpansionMrr] = useState<string>("20000")
    const [churnMrr, setChurnMrr] = useState<string>("15000")
    const [contractionMrr, setContractionMrr] = useState<string>("5000")

    const metrics = useMemo(() => {
        const newRev = Number(newMrr)
        const expansion = Number(expansionMrr)
        const churn = Number(churnMrr)
        const contraction = Number(contractionMrr)

        if (![newRev, expansion, churn, contraction].every(n => Number.isFinite(n) && n >= 0)) {
            return { quickRatio: 0, netMrr: 0, growthMrr: 0, lostMrr: 0 }
        }

        const growthMrr = newRev + expansion
        const lostMrr = churn + contraction

        // Quick Ratio = (New MRR + Expansion MRR) / (Churned MRR + Contraction MRR)
        const quickRatio = lostMrr > 0 ? growthMrr / lostMrr : growthMrr > 0 ? Infinity : 0

        const netMrr = growthMrr - lostMrr

        return { quickRatio, netMrr, growthMrr, lostMrr }
    }, [newMrr, expansionMrr, churnMrr, contractionMrr])

    const ratioInfo = getQuickRatioLabel(metrics.quickRatio)

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Quick Ratio Calculator</h2>
                <p>
                    Calculate your SaaS Quick Ratio to measure growth efficiency. A Quick Ratio above 4 indicates efficient, sustainable growth.
                </p>
                <p>
                    Formula: <code>Quick Ratio = (New MRR + Expansion) ÷ (Churn + Contraction)</code>
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">MRR Components</CardTitle>
                        <CardDescription>Enter your monthly recurring revenue changes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-green-600 dark:text-green-400">Growth</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="newMrr">New MRR ($)</Label>
                                    <Input
                                        id="newMrr"
                                        type="number"
                                        min="0"
                                        value={newMrr}
                                        onChange={(e) => setNewMrr(e.target.value)}
                                        className="border-green-200 dark:border-green-800"
                                    />
                                    <p className="text-xs text-accent">Revenue from new customers</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expansionMrr">Expansion MRR ($)</Label>
                                    <Input
                                        id="expansionMrr"
                                        type="number"
                                        min="0"
                                        value={expansionMrr}
                                        onChange={(e) => setExpansionMrr(e.target.value)}
                                        className="border-green-200 dark:border-green-800"
                                    />
                                    <p className="text-xs text-accent">Upgrades and add-ons from existing customers</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-red-600 dark:text-red-400">Lost</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="churnMrr">Churned MRR ($)</Label>
                                    <Input
                                        id="churnMrr"
                                        type="number"
                                        min="0"
                                        value={churnMrr}
                                        onChange={(e) => setChurnMrr(e.target.value)}
                                        className="border-red-200 dark:border-red-800"
                                    />
                                    <p className="text-xs text-accent">Revenue from cancelled customers</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contractionMrr">Contraction MRR ($)</Label>
                                    <Input
                                        id="contractionMrr"
                                        type="number"
                                        min="0"
                                        value={contractionMrr}
                                        onChange={(e) => setContractionMrr(e.target.value)}
                                        className="border-red-200 dark:border-red-800"
                                    />
                                    <p className="text-xs text-accent">Downgrades from existing customers</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Quick Ratio</CardTitle>
                        <CardDescription>Your growth efficiency score.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                                <div className={`text-5xl font-bold ${ratioInfo.color}`}>
                                    {metrics.quickRatio === Infinity ? "∞" : metrics.quickRatio.toFixed(2)}
                                </div>
                                <div className={`text-sm mt-1 ${ratioInfo.color}`}>{ratioInfo.label}</div>
                                <div className="text-xs text-accent mt-0.5">{ratioInfo.description}</div>
                            </div>
                            <div className="flex-1 max-w-xs">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-accent">Quick Ratio</span>
                                        <span className="text-accent">Target: 4.0</span>
                                    </div>
                                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${metrics.quickRatio >= 4 ? "bg-green-500" :
                                                    metrics.quickRatio >= 2 ? "bg-blue-500" :
                                                        metrics.quickRatio >= 1 ? "bg-yellow-500" : "bg-red-500"
                                                }`}
                                            style={{ width: `${Math.min((metrics.quickRatio / 4) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">MRR Summary</CardTitle>
                        <CardDescription>Monthly revenue breakdown.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-stretch">
                            <div className="rounded-md border border-green-200 dark:border-green-800 p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-green-600 dark:text-green-400">Growth MRR</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {formatCurrency(metrics.growthMrr)}
                                </div>
                            </div>
                            <div className="rounded-md border border-red-200 dark:border-red-800 p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-red-600 dark:text-red-400">Lost MRR</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {formatCurrency(metrics.lostMrr)}
                                </div>
                            </div>
                            <div className={`rounded-md border-2 p-3 text-center flex flex-col items-center justify-center min-h-[72px] ${metrics.netMrr >= 0 ? "border-green-500" : "border-red-500"
                                }`}>
                                <div className="text-xs text-accent">Net MRR Change</div>
                                <div className={`mt-1 font-mono text-base leading-tight ${metrics.netMrr >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                    }`}>
                                    {metrics.netMrr >= 0 ? "+" : ""}{formatCurrency(metrics.netMrr)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>Understanding Quick Ratio</h3>
                <p>
                    Quick Ratio measures how efficiently you&apos;re growing by comparing acquired revenue to lost revenue. Higher is better.
                </p>

                <h4>Benchmarks</h4>
                <ul>
                    <li><strong>4.0+</strong> — Best-in-class SaaS companies</li>
                    <li><strong>2.0-4.0</strong> — Healthy, sustainable growth</li>
                    <li><strong>1.0-2.0</strong> — Growing but efficiency needs work</li>
                    <li><strong>&lt;1.0</strong> — Losing more revenue than gaining</li>
                </ul>

                <h4>Improving Quick Ratio</h4>
                <ul>
                    <li>Focus on reducing churn through better onboarding.</li>
                    <li>Drive expansion through upsells and add-ons.</li>
                    <li>Improve customer success to prevent downgrades.</li>
                    <li>Target higher-quality customer segments.</li>
                </ul>
            </section>
        </div>
    )
}
