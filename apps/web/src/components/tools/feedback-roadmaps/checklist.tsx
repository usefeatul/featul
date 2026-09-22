"use client"

import { useMemo, useState } from "react"
import { Check } from "lucide-react"
import BackLink from "@/components/tools/global/backlink"
import ToolProductCta from "@/components/tools/global/product-cta"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { cn } from "@featul/ui/lib/utils"

const ITEMS = [
    { id: "unique-votes", label: "One vote per person (no vote stacking)" },
    { id: "anonymous", label: "Anonymous or guest submissions are optional, not required" },
    { id: "gdpr", label: "Privacy notice and GDPR/EU hosting called out for visitors" },
    { id: "pii", label: "Moderation path for names, emails, and other PII in posts" },
    { id: "visibility", label: "Public vs private board choice is explicit" },
    { id: "status", label: "Voters get status updates (Planned, In progress, Shipped)" },
    { id: "duplicates", label: "Team can merge duplicate requests" },
    { id: "branding", label: "Board branding or custom domain matches the product" },
] as const

export default function PublicBoardChecklistTool() {
    const [done, setDone] = useState<Record<string, boolean>>({
        "unique-votes": true,
        anonymous: true,
    })

    const metrics = useMemo(() => {
        const completed = ITEMS.filter((item) => done[item.id]).length
        const score = (completed / ITEMS.length) * 100
        return { completed, score }
    }, [done])

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Public Feedback Board Checklist</h2>
                <p>
                    Walk through anonymous voting, moderation, and GDPR settings before you share a public board URL.
                </p>
                <p>
                    Formula: <code>checklist score = completed items ÷ total items</code>
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Launch checklist</CardTitle>
                        <CardDescription>Toggle items you already have in place.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {ITEMS.map((item) => {
                            const checked = Boolean(done[item.id])
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setDone((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                                    className={cn(
                                        "flex w-full items-start gap-3 rounded-md border p-3 text-left text-sm transition",
                                        checked ? "border-primary/30 bg-primary/5" : "hover:bg-muted/40",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-sm border",
                                            checked ? "border-primary bg-primary text-primary-foreground" : "border-border",
                                        )}
                                    >
                                        {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
                                    </span>
                                    {item.label}
                                </button>
                            )
                        })}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Readiness</CardTitle>
                        <CardDescription>Aim for every item before a public launch.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center">
                            <div className="text-5xl font-bold">{metrics.score.toFixed(0)}%</div>
                            <div className="text-accent mt-1 text-sm">
                                {metrics.completed} of {ITEMS.length} complete
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <ToolProductCta
                    title="Launch a public board on Featul"
                    description="EU-hosted boards with voting, moderation, branding, and status updates out of the box."
                />
                <BackLink />
            </div>
        </div>
    )
}
