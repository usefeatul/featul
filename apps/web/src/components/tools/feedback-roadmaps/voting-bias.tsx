"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import ToolProductCta from "@/components/tools/global/product-cta"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"

function biasLabel(votesPerVoter: number, topShare: number): { label: string; color: string; hint: string } {
    if (votesPerVoter > 3 || topShare >= 50) {
        return { label: "High concentration", color: "text-red-600 dark:text-red-400", hint: "A small group is driving the score. Weight unique voters." }
    }
    if (votesPerVoter > 1.5 || topShare >= 30) {
        return { label: "Moderate skew", color: "text-yellow-600 dark:text-yellow-400", hint: "Check power users before promoting this to the roadmap." }
    }
    return { label: "Broad support", color: "text-green-600 dark:text-green-400", hint: "Unique voters and total votes tell a similar story." }
}

export default function VotingBiasTool() {
    const [uniqueVoters, setUniqueVoters] = useState("120")
    const [totalVotes, setTotalVotes] = useState("210")
    const [topShare, setTopShare] = useState("22")

    const metrics = useMemo(() => {
        const voters = Number(uniqueVoters)
        const votes = Number(totalVotes)
        const share = Number(topShare)
        if (![voters, votes, share].every(Number.isFinite) || voters <= 0 || votes < 0 || share < 0) {
            return { votesPerVoter: 0, extraVotes: 0, valid: false }
        }
        return {
            votesPerVoter: votes / voters,
            extraVotes: Math.max(0, votes - voters),
            valid: true,
        }
    }, [uniqueVoters, totalVotes, topShare])

    const info = biasLabel(metrics.votesPerVoter, Number(topShare) || 0)

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Feature Voting Bias Checker</h2>
                <p>
                    Compare unique voters to total upvotes so a few power users do not decide the public roadmap.
                </p>
                <p>
                    Formula: <code>votes per voter = total votes ÷ unique voters</code>
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Board counts</CardTitle>
                        <CardDescription>Use one request, or roll up a whole board.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="voters">Unique voters</Label>
                                <Input id="voters" type="number" min="1" value={uniqueVoters} onChange={(e) => setUniqueVoters(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="votes">Total votes</Label>
                                <Input id="votes" type="number" min="0" value={totalVotes} onChange={(e) => setTotalVotes(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="topShare">Top 10% vote share (%)</Label>
                                <Input id="topShare" type="number" min="0" max="100" value={topShare} onChange={(e) => setTopShare(e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Bias check</CardTitle>
                        <CardDescription>Higher votes per voter means more repeat voting.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-md border p-3 text-center">
                                <div className="text-xs text-accent">Votes per voter</div>
                                <div className="mt-1 font-mono text-xl">{metrics.valid ? metrics.votesPerVoter.toFixed(2) : "—"}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center">
                                <div className="text-xs text-accent">Repeat votes</div>
                                <div className="mt-1 font-mono text-xl">{metrics.valid ? metrics.extraVotes.toLocaleString() : "—"}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center">
                                <div className="text-xs text-accent">Reading</div>
                                <div className={`mt-1 text-sm font-medium ${info.color}`}>{metrics.valid ? info.label : "—"}</div>
                            </div>
                        </div>
                        <p className="text-accent mt-4 text-sm">{metrics.valid ? info.hint : "Enter unique voters and total votes."}</p>
                    </CardContent>
                </Card>

                <ToolProductCta
                    title="Count unique voters in Featul"
                    description="Public boards with one vote per person make prioritization fairer than raw upvote totals."
                />
                <BackLink />
            </div>
        </div>
    )
}
