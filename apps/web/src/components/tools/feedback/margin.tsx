"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@featul/ui/components/select"

function getZScore(confidenceLevel: number): number {
    const zScores: Record<number, number> = {
        80: 1.28,
        85: 1.44,
        90: 1.645,
        95: 1.96,
        99: 2.576,
    }
    return zScores[confidenceLevel] || 1.96
}

function getMoeLabel(moe: number): { label: string; color: string } {
    if (moe <= 3) return { label: "Excellent Precision", color: "text-green-600 dark:text-green-400" }
    if (moe <= 5) return { label: "Good Precision", color: "text-blue-600 dark:text-blue-400" }
    if (moe <= 10) return { label: "Acceptable", color: "text-yellow-600 dark:text-yellow-400" }
    return { label: "Low Precision", color: "text-red-600 dark:text-red-400" }
}

export default function MarginOfErrorCalculatorTool() {
    const [sampleSize, setSampleSize] = useState<string>("385")
    const [population, setPopulation] = useState<string>("10000")
    const [confidenceLevel, setConfidenceLevel] = useState<string>("95")
    const [proportion, setProportion] = useState<string>("50")

    const metrics = useMemo(() => {
        const n = Number(sampleSize)
        const N = Number(population)
        const confidence = Number(confidenceLevel)
        const p = Number(proportion) / 100

        if (!Number.isFinite(n) || !Number.isFinite(N) || n <= 0 || N <= 0 || p < 0 || p > 1) {
            return { moe: 0, moeWithFpc: 0, lowerBound: 0, upperBound: 0 }
        }

        const Z = getZScore(confidence)

        // Standard margin of error: MOE = Z × sqrt((p × (1-p)) / n)
        const moe = Z * Math.sqrt((p * (1 - p)) / n) * 100

        // Finite population correction factor
        const fpc = Math.sqrt((N - n) / (N - 1))
        const moeWithFpc = moe * fpc

        // Confidence interval bounds
        const lowerBound = (p * 100) - moeWithFpc
        const upperBound = (p * 100) + moeWithFpc

        return { moe, moeWithFpc, lowerBound: Math.max(0, lowerBound), upperBound: Math.min(100, upperBound) }
    }, [sampleSize, population, confidenceLevel, proportion])

    const moeInfo = getMoeLabel(metrics.moeWithFpc)

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Margin of Error Calculator</h2>
                <p>
                    Calculate the margin of error for your survey results to understand the precision of your data.
                </p>
                <p>
                    Formula: <code>MOE = Z × √((p × (1-p)) ÷ n)</code>
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Survey Parameters</CardTitle>
                        <CardDescription>Enter your survey details to calculate margin of error.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sampleSize">Sample Size (Responses)</Label>
                                <Input
                                    id="sampleSize"
                                    type="number"
                                    min="1"
                                    value={sampleSize}
                                    onChange={(e) => setSampleSize(e.target.value)}
                                />
                                <p className="text-xs text-accent">Number of survey responses collected</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="population">Population Size</Label>
                                <Input
                                    id="population"
                                    type="number"
                                    min="1"
                                    value={population}
                                    onChange={(e) => setPopulation(e.target.value)}
                                />
                                <p className="text-xs text-accent">Total people you could have surveyed</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confidence">Confidence Level</Label>
                                <Select value={confidenceLevel} onValueChange={setConfidenceLevel}>
                                    <SelectTrigger id="confidence">
                                        <SelectValue placeholder="Select confidence level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="80">80%</SelectItem>
                                        <SelectItem value="85">85%</SelectItem>
                                        <SelectItem value="90">90%</SelectItem>
                                        <SelectItem value="95">95% (Standard)</SelectItem>
                                        <SelectItem value="99">99%</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="proportion">Response Proportion (%)</Label>
                                <Input
                                    id="proportion"
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={proportion}
                                    onChange={(e) => setProportion(e.target.value)}
                                />
                                <p className="text-xs text-accent">% who answered a certain way (50% is most conservative)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Margin of Error</CardTitle>
                        <CardDescription>The accuracy of your survey results.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                                <div className={`text-5xl font-bold ${moeInfo.color}`}>
                                    ±{metrics.moeWithFpc.toFixed(1)}%
                                </div>
                                <div className={`text-sm mt-1 ${moeInfo.color}`}>{moeInfo.label}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Confidence Interval</CardTitle>
                        <CardDescription>Range where the true value likely falls.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                            <div className="rounded-md border p-4 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">Lower Bound</div>
                                <div className="mt-1 font-mono text-xl leading-tight text-foreground">
                                    {metrics.lowerBound.toFixed(1)}%
                                </div>
                            </div>
                            <div className="rounded-md border-2 border-primary/50 p-4 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">Observed Value</div>
                                <div className="mt-1 font-mono text-xl font-bold leading-tight text-foreground">
                                    {proportion}%
                                </div>
                            </div>
                            <div className="rounded-md border p-4 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">Upper Bound</div>
                                <div className="mt-1 font-mono text-xl leading-tight text-foreground">
                                    {metrics.upperBound.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 p-3 rounded-md bg-zinc-50 dark:bg-zinc-900">
                            <p className="text-sm text-center text-accent">
                                At {confidenceLevel}% confidence, the true value is between{" "}
                                <span className="font-mono font-medium">{metrics.lowerBound.toFixed(1)}%</span> and{" "}
                                <span className="font-mono font-medium">{metrics.upperBound.toFixed(1)}%</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Calculation Details</CardTitle>
                        <CardDescription>With and without finite population correction.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 items-stretch">
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Standard MOE</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    ±{metrics.moe.toFixed(2)}%
                                </div>
                                <div className="text-xs text-accent mt-0.5">without FPC</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Adjusted MOE</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    ±{metrics.moeWithFpc.toFixed(2)}%
                                </div>
                                <div className="text-xs text-accent mt-0.5">with FPC</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>Understanding Margin of Error</h3>
                <p>
                    Margin of error indicates how much survey results may differ from the true population value.
                </p>

                <h4>Key Factors</h4>
                <ul>
                    <li><strong>Sample size</strong> — Larger samples = smaller MOE</li>
                    <li><strong>Confidence level</strong> — Higher confidence = larger MOE</li>
                    <li><strong>Population size</strong> — Matters more for small populations</li>
                    <li><strong>Response proportion</strong> — 50% gives the widest (most conservative) MOE</li>
                </ul>

                <h4>MOE Guidelines</h4>
                <ul>
                    <li><strong>±3% or less</strong> — High precision, reliable for decisions</li>
                    <li><strong>±5%</strong> — Standard precision, commonly accepted</li>
                    <li><strong>±10%</strong> — Directional only, use with caution</li>
                </ul>
            </section>
        </div>
    )
}
