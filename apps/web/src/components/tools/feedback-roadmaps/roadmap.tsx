"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import ToolProductCta from "@/components/tools/global/product-cta"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"
import { Textarea } from "@featul/ui/components/textarea"
import { Button } from "@featul/ui/components/button"

export default function RoadmapTemplateTool() {
    const [product, setProduct] = useState("Acme")
    const [planned, setPlanned] = useState("SSO for workspace admins\nCSV export for feedback")
    const [progress, setProgress] = useState("Public changelog RSS")
    const [shipped, setShipped] = useState("Feature voting on the public board")
    const [copied, setCopied] = useState(false)

    const markdown = useMemo(() => {
        const list = (value: string) =>
            value
                .split("\n")
                .map((line) => line.replace(/^[-*]\s*/, "").trim())
                .filter(Boolean)
                .map((line) => `- ${line}`)
                .join("\n") || "- _Add items_"

        return `# ${product || "Product"} public roadmap

Statuses move left to right: **Planned → In progress → Shipped**. Dates are direction, not contracts.

## Planned
${list(planned)}

## In progress
${list(progress)}

## Shipped
${list(shipped)}
`
    }, [planned, product, progress, shipped])

    async function copyTemplate() {
        try {
            await navigator.clipboard.writeText(markdown)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2000)
        } catch {
            setCopied(false)
        }
    }

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Public Roadmap Status Template</h2>
                <p>
                    Generate Planned, In progress, and Shipped copy for a customer-facing roadmap.
                </p>
                <p>
                    Formula: <code>Planned → In Progress → Shipped</code>
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Roadmap columns</CardTitle>
                        <CardDescription>One feature per line. Keep wording customer-facing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="product">Product name</Label>
                            <Input id="product" value={product} onChange={(e) => setProduct(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="planned">Planned</Label>
                            <Textarea id="planned" rows={3} value={planned} onChange={(e) => setPlanned(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="progress">In progress</Label>
                            <Textarea id="progress" rows={3} value={progress} onChange={(e) => setProgress(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shipped">Shipped</Label>
                            <Textarea id="shipped" rows={3} value={shipped} onChange={(e) => setShipped(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Template</CardTitle>
                        <CardDescription>Paste into docs today, or recreate as columns in Featul.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <pre className="overflow-x-auto rounded-md border bg-muted p-3 text-sm whitespace-pre-wrap">{markdown}</pre>
                        <Button type="button" variant="outline" onClick={copyTemplate}>
                            {copied ? "Copied" : "Copy markdown"}
                        </Button>
                    </CardContent>
                </Card>

                <ToolProductCta
                    title="Publish a live public roadmap"
                    description="Link roadmap columns to voted requests so customers see what is planned, in progress, and shipped."
                />
                <BackLink />
            </div>
        </div>
    )
}
