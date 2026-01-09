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

export default function SampleSizeCalculatorTool() {
    const [population, setPopulation] = useState<string>("10000")
    const [confidenceLevel, setConfidenceLevel] = useState<string>("95")
    const [marginOfError, setMarginOfError] = useState<string>("5")
    const [expectedResponse, setExpectedResponse] = useState<string>("50")

    const metrics = useMemo(() => {
        const N = Number(population)
        const confidence = Number(confidenceLevel)
        const E = Number(marginOfError) / 100
        const p = Number(expectedResponse) / 100

        if (![N, confidence, E, p].every(Number.isFinite) || N <= 0 || E <= 0 || p < 0 || p > 1) {
            return { sampleSize: 0, infiniteSampleSize: 0, surveysSent: 0 }
        }

        const Z = getZScore(confidence)

        // Sample size for infinite population: n = (Z² × p × (1-p)) / E²
        const infiniteSampleSize = (Z * Z * p * (1 - p)) / (E * E)

        // Finite population correction: n_adjusted = n / (1 + ((n - 1) / N))
        const sampleSize = Math.ceil(infiniteSampleSize / (1 + ((infiniteSampleSize - 1) / N)))

        // Response rate needed (assuming 30% typical response rate)
        const responseRate = 30
        const surveysSent = Math.ceil(sampleSize / (responseRate / 100))

        return { sampleSize, infiniteSampleSize: Math.ceil(infiniteSampleSize), surveysSent }
    }, [population, confidenceLevel, marginOfError, expectedResponse])

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Survey Sample Size Calculator</h2>
                <p>
                    Calculate the ideal sample size needed for statistically significant survey results based on your population size, desired confidence level, and margin of error.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Parameters</CardTitle>
                        <CardDescription>Define your survey requirements.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="population">Population Size</Label>
                                <Input
                                    id="population"
                                    type="number"
                                    min="1"
                                    value={population}
                                    onChange={(e) => setPopulation(e.target.value)}
                                    placeholder="Total target population"
                                />
                                <p className="text-xs text-accent">Total number of people you could survey</p>
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
                                        <SelectItem value="95">95% (Recommended)</SelectItem>
                                        <SelectItem value="99">99%</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-accent">How confident you want to be in results</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="margin">Margin of Error (%)</Label>
                                <Input
                                    id="margin"
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={marginOfError}
                                    onChange={(e) => setMarginOfError(e.target.value)}
                                />
                                <p className="text-xs text-accent">Acceptable range of error (±)</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="response">Expected Response (%)</Label>
                                <Input
                                    id="response"
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={expectedResponse}
                                    onChange={(e) => setExpectedResponse(e.target.value)}
                                />
                                <p className="text-xs text-accent">Expected % choosing a particular answer (50% is most conservative)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Required Sample Size</CardTitle>
                        <CardDescription>Number of responses needed for statistical significance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                            <div className="rounded-md border-2 border-primary/50 p-4 text-center flex flex-col items-center justify-center min-h-[100px]">
                                <div className="text-xs text-accent">Required Sample Size</div>
                                <div className="mt-1 font-mono text-3xl font-bold leading-tight text-foreground">
                                    {metrics.sampleSize.toLocaleString()}
                                </div>
                                <div className="text-xs text-accent mt-1">responses needed</div>
                            </div>
                            <div className="rounded-md border p-4 text-center flex flex-col items-center justify-center min-h-[100px]">
                                <div className="text-xs text-accent">Infinite Population</div>
                                <div className="mt-1 font-mono text-xl leading-tight text-foreground">
                                    {metrics.infiniteSampleSize.toLocaleString()}
                                </div>
                                <div className="text-xs text-accent mt-1">without finite correction</div>
                            </div>
                            <div className="rounded-md border p-4 text-center flex flex-col items-center justify-center min-h-[100px]">
                                <div className="text-xs text-accent">Surveys to Send</div>
                                <div className="mt-1 font-mono text-xl leading-tight text-foreground">
                                    {metrics.surveysSent.toLocaleString()}
                                </div>
                                <div className="text-xs text-accent mt-1">assuming 30% response rate</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Quick Reference</CardTitle>
                        <CardDescription>Common sample sizes at 95% confidence, 5% margin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                { pop: "100", sample: "80" },
                                { pop: "500", sample: "217" },
                                { pop: "1,000", sample: "278" },
                                { pop: "10,000", sample: "370" },
                                { pop: "100,000+", sample: "384" },
                            ].map((item) => (
                                <div key={item.pop} className="rounded-md border p-2 text-center">
                                    <div className="text-xs text-accent">Pop: {item.pop}</div>
                                    <div className="font-mono text-sm text-foreground">{item.sample}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>Understanding Sample Size</h3>
                <p>
                    Sample size determines how reliably your survey results represent the entire population. Larger samples increase accuracy but also cost more.
                </p>

                <h4>Key Concepts</h4>
                <ul>
                    <li><strong>Confidence Level</strong> — Probability that results fall within the margin of error (95% is standard).</li>
                    <li><strong>Margin of Error</strong> — Range within which the true value lies (±5% is common).</li>
                    <li><strong>Population Size</strong> — Total people you could survey. Above ~10,000, it barely affects sample size.</li>
                </ul>

                <h4>Tips for Survey Success</h4>
                <ul>
                    <li>Plan for low response rates—send 3-5x your needed sample.</li>
                    <li>Keep surveys short to improve completion rates.</li>
                    <li>Send reminders to boost response rates.</li>
                    <li>Offer incentives for participation.</li>
                </ul>
            </section>
        </div>
    )
}
