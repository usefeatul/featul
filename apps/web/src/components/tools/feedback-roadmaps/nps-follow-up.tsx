"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import ToolProductCta from "@/components/tools/global/product-cta"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"

export default function NpsFollowUpTool() {
    const [promoters, setPromoters] = useState("42")
    const [passives, setPassives] = useState("31")
    const [detractors, setDetractors] = useState("17")

    const metrics = useMemo(() => {
        const pro = Number(promoters)
        const pas = Number(passives)
        const det = Number(detractors)
        if (![pro, pas, det].every(Number.isFinite) || [pro, pas, det].some((n) => n < 0)) {
            return { total: 0, nps: 0, interviews: 0, boardPosts: 0, valid: false }
        }
        const total = pro + pas + det
        if (total === 0) return { total: 0, nps: 0, interviews: 0, boardPosts: 0, valid: false }
        const nps = ((pro - det) / total) * 100
        const interviews = Math.ceil(det * 0.25) + Math.ceil(pas * 0.1)
        const boardPosts = Math.max(3, Math.ceil(det * 0.4) + Math.ceil(pas * 0.15))
        return { total, nps, interviews, boardPosts, valid: true }
    }, [detractors, passives, promoters])

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>NPS Follow-up Planner</h2>
                <p>
                    Turn promoters, passives, and detractors into interview counts and feedback-board prompts so NPS is not a vanity score.
                </p>
                <p>
                    Formula: <code>NPS = % promoters − % detractors</code>
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Survey responses</CardTitle>
                        <CardDescription>Counts from your latest NPS wave.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="promoters">Promoters (9–10)</Label>
                                <Input id="promoters" type="number" min="0" value={promoters} onChange={(e) => setPromoters(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="passives">Passives (7–8)</Label>
                                <Input id="passives" type="number" min="0" value={passives} onChange={(e) => setPassives(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="detractors">Detractors (0–6)</Label>
                                <Input id="detractors" type="number" min="0" value={detractors} onChange={(e) => setDetractors(e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Close-the-loop plan</CardTitle>
                        <CardDescription>Interview detractors first, then invite themes onto a public board.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-md border p-3 text-center">
                                <div className="text-xs text-accent">NPS</div>
                                <div className="mt-1 font-mono text-3xl">{metrics.valid ? Math.round(metrics.nps) : "—"}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center">
                                <div className="text-xs text-accent">Interviews to book</div>
                                <div className="mt-1 font-mono text-3xl">{metrics.valid ? metrics.interviews : "—"}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center">
                                <div className="text-xs text-accent">Board prompts</div>
                                <div className="mt-1 font-mono text-3xl">{metrics.valid ? metrics.boardPosts : "—"}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Prompts to post</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-accent list-disc space-y-2 pl-5 text-sm">
                            <li>What almost made you a promoter this month?</li>
                            <li>Which missing feature would change your score the most?</li>
                            <li>If we shipped one request from the board, which should it be?</li>
                        </ul>
                    </CardContent>
                </Card>

                <ToolProductCta
                    title="Turn NPS comments into board posts"
                    description="Featul keeps follow-up feedback, votes, and changelog updates in one workspace."
                />
                <BackLink />
            </div>
        </div>
    )
}
