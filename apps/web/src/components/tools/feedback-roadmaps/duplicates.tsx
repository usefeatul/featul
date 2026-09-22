"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import ToolProductCta from "@/components/tools/global/product-cta"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"

export default function DuplicateFeedbackTool() {
    const [raw, setRaw] = useState("180")
    const [duplicateRate, setDuplicateRate] = useState("40")
    const [alreadyMerged, setAlreadyMerged] = useState("12")

    const metrics = useMemo(() => {
        const requests = Number(raw)
        const rate = Number(duplicateRate) / 100
        const merged = Number(alreadyMerged)
        if (![requests, rate, merged].every(Number.isFinite) || requests < 0 || rate < 0 || rate > 1 || merged < 0) {
            return { unique: 0, duplicates: 0, remaining: 0, valid: false }
        }
        const unique = Math.max(0, Math.round(requests * (1 - rate)))
        const duplicates = Math.max(0, requests - unique)
        const remaining = Math.max(0, unique - merged)
        return { unique, duplicates, remaining, valid: true }
    }, [alreadyMerged, duplicateRate, raw])

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Duplicate Feedback Estimator</h2>
                <p>
                    Estimate unique themes after grouping duplicate feature requests from tickets, Slack, and the board.
                </p>
                <p>
                    Formula: <code>unique themes = raw requests × (1 − duplicate rate) − already merged</code>
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Inbox volume</CardTitle>
                        <CardDescription>SaaS boards often see 30–50% duplicates before triage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="raw">Raw requests</Label>
                                <Input id="raw" type="number" min="0" value={raw} onChange={(e) => setRaw(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rate">Estimated duplicate rate (%)</Label>
                                <Input id="rate" type="number" min="0" max="100" value={duplicateRate} onChange={(e) => setDuplicateRate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="merged">Already merged</Label>
                                <Input id="merged" type="number" min="0" value={alreadyMerged} onChange={(e) => setAlreadyMerged(e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Theme estimate</CardTitle>
                        <CardDescription>Score remaining unique themes with RICE, not the raw pile.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-md border p-3 text-center">
                                <div className="text-xs text-accent">Likely duplicates</div>
                                <div className="mt-1 font-mono text-3xl">{metrics.valid ? metrics.duplicates.toLocaleString() : "—"}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center">
                                <div className="text-xs text-accent">Unique themes</div>
                                <div className="mt-1 font-mono text-3xl">{metrics.valid ? metrics.unique.toLocaleString() : "—"}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center">
                                <div className="text-xs text-accent">Left to review</div>
                                <div className="mt-1 font-mono text-3xl">{metrics.valid ? metrics.remaining.toLocaleString() : "—"}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <ToolProductCta
                    title="Merge duplicates on a Featul board"
                    description="Group the same idea, keep the vote count, and prioritize unique themes instead of noise."
                />
                <BackLink />
            </div>
        </div>
    )
}
