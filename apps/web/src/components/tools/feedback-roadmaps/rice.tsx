"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import ToolProductCta from "@/components/tools/global/product-cta"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@featul/ui/components/select"

function scoreLabel(score: number): { label: string; color: string } {
    if (score >= 80) return { label: "Ship next", color: "text-green-600 dark:text-green-400" }
    if (score >= 40) return { label: "Strong candidate", color: "text-blue-600 dark:text-blue-400" }
    if (score >= 15) return { label: "Worth a review", color: "text-yellow-600 dark:text-yellow-400" }
    return { label: "Park or split", color: "text-orange-600 dark:text-orange-400" }
}

export default function RicePrioritizationTool() {
    const [reach, setReach] = useState("800")
    const [impact, setImpact] = useState("2")
    const [confidence, setConfidence] = useState("80")
    const [effort, setEffort] = useState("2")

    const metrics = useMemo(() => {
        const r = Number(reach)
        const i = Number(impact)
        const c = Number(confidence) / 100
        const e = Number(effort)
        if (![r, i, c, e].every(Number.isFinite) || r < 0 || i <= 0 || c < 0 || e <= 0) {
            return { score: 0, valid: false }
        }
        return { score: (r * i * c) / e, valid: true }
    }, [reach, impact, confidence, effort])

    const info = scoreLabel(metrics.score)

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>RICE Prioritization Calculator</h2>
                <p>
                    Score a feature request with Reach, Impact, Confidence, and Effort so votes become a ranked backlog instead of a popularity contest.
                </p>
                <p>
                    Formula: <code>RICE = (Reach × Impact × Confidence) ÷ Effort</code>
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Feature inputs</CardTitle>
                        <CardDescription>Use unique voters for reach when you have a public board.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="reach">Reach (people per quarter)</Label>
                                <Input id="reach" type="number" min="0" value={reach} onChange={(e) => setReach(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="impact">Impact</Label>
                                <Select value={impact} onValueChange={setImpact}>
                                    <SelectTrigger id="impact">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0.25">Minimal (0.25)</SelectItem>
                                        <SelectItem value="0.5">Low (0.5)</SelectItem>
                                        <SelectItem value="1">Medium (1)</SelectItem>
                                        <SelectItem value="2">High (2)</SelectItem>
                                        <SelectItem value="3">Massive (3)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confidence">Confidence (%)</Label>
                                <Input id="confidence" type="number" min="0" max="100" value={confidence} onChange={(e) => setConfidence(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="effort">Effort (person-months)</Label>
                                <Input id="effort" type="number" min="0.1" step="0.1" value={effort} onChange={(e) => setEffort(e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">RICE score</CardTitle>
                        <CardDescription>Higher scores should be reviewed for the roadmap first.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center">
                            <div className={`text-5xl font-bold ${info.color}`}>{metrics.valid ? metrics.score.toFixed(1) : "—"}</div>
                            <div className={`mt-1 text-sm ${info.color}`}>{metrics.valid ? info.label : "Enter valid inputs"}</div>
                        </div>
                    </CardContent>
                </Card>

                <ToolProductCta
                    title="Prioritize live votes in Featul"
                    description="Collect feature requests, see unique voters, and move scored work onto a public roadmap."
                />
                <BackLink />
            </div>

            <section className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-8">
                <h3>How to use RICE with a feedback board</h3>
                <ul>
                    <li>Set Reach to unique voters or affected customers, not raw upvotes.</li>
                    <li>Keep Impact on the 0.25–3 scale so scores stay comparable.</li>
                    <li>Lower Confidence when the request is a single anecdote.</li>
                    <li>Split large efforts so one epic does not bury several smaller wins.</li>
                </ul>
            </section>
        </div>
    )
}
