"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import ToolProductCta from "@/components/tools/global/product-cta"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@featul/ui/components/select"

function getZScore(confidenceLevel: number): number {
    const zScores: Record<number, number> = {
        80: 1.28,
        90: 1.645,
        95: 1.96,
        99: 2.576,
    }
    return zScores[confidenceLevel] || 1.96
}

export default function VoteConfidenceTool() {
    const [population, setPopulation] = useState("2500")
    const [confidenceLevel, setConfidenceLevel] = useState("95")
    const [marginOfError, setMarginOfError] = useState("5")
    const [currentVotes, setCurrentVotes] = useState("18")

    const metrics = useMemo(() => {
        const N = Number(population)
        const confidence = Number(confidenceLevel)
        const E = Number(marginOfError) / 100
        const current = Number(currentVotes)
        const p = 0.5

        if (![N, confidence, E, current].every(Number.isFinite) || N <= 0 || E <= 0 || current < 0) {
            return { needed: 0, remaining: 0, valid: false }
        }

        const Z = getZScore(confidence)
        const infinite = (Z * Z * p * (1 - p)) / (E * E)
        const needed = Math.ceil(infinite / (1 + (infinite - 1) / N))
        return { needed, remaining: Math.max(0, needed - current), valid: true }
    }, [confidenceLevel, currentVotes, marginOfError, population])

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Feedback Vote Confidence Calculator</h2>
                <p>
                    Estimate how many unique votes a feature request needs from your user base before demand looks reliable.
                </p>
                <p>
                    Formula: <code>n = (Z² × p × (1 − p)) / E²</code> with a finite population correction.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Board audience</CardTitle>
                        <CardDescription>Use monthly active users who can see the board, not the whole internet.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="population">Users who can vote</Label>
                                <Input id="population" type="number" min="1" value={population} onChange={(e) => setPopulation(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="current">Current unique votes</Label>
                                <Input id="current" type="number" min="0" value={currentVotes} onChange={(e) => setCurrentVotes(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confidence">Confidence level</Label>
                                <Select value={confidenceLevel} onValueChange={setConfidenceLevel}>
                                    <SelectTrigger id="confidence">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="80">80%</SelectItem>
                                        <SelectItem value="90">90%</SelectItem>
                                        <SelectItem value="95">95%</SelectItem>
                                        <SelectItem value="99">99%</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="moe">Margin of error (%)</Label>
                                <Input id="moe" type="number" min="1" max="20" value={marginOfError} onChange={(e) => setMarginOfError(e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Votes needed</CardTitle>
                        <CardDescription>Treat this as a directional check, not a ship/no-ship law.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-md border p-3 text-center">
                                <div className="text-xs text-accent">Unique votes to target</div>
                                <div className="mt-1 font-mono text-3xl">{metrics.valid ? metrics.needed.toLocaleString() : "—"}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center">
                                <div className="text-xs text-accent">Still needed</div>
                                <div className="mt-1 font-mono text-3xl">{metrics.valid ? metrics.remaining.toLocaleString() : "—"}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <ToolProductCta
                    title="Collect unique votes in Featul"
                    description="A public board makes it obvious when a request still needs more customers behind it."
                />
                <BackLink />
            </div>
        </div>
    )
}
