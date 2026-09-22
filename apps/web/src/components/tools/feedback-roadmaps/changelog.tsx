"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import ToolProductCta from "@/components/tools/global/product-cta"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"
import { Textarea } from "@featul/ui/components/textarea"
import { Button } from "@featul/ui/components/button"

function lines(value: string) {
    return value
        .split("\n")
        .map((line) => line.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean)
}

function section(title: string, items: string[]) {
    if (!items.length) return ""
    return `### ${title}\n${items.map((item) => `- ${item}`).join("\n")}\n`
}

export default function ChangelogGeneratorTool() {
    const [version, setVersion] = useState("1.4.0")
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
    const [added, setAdded] = useState("Public roadmap subscriptions\nCustom board branding")
    const [changed, setChanged] = useState("Faster voting on large boards")
    const [fixed, setFixed] = useState("Duplicate vote counting on guest sessions")
    const [copied, setCopied] = useState(false)

    const markdown = useMemo(() => {
        const body = [
            section("Added", lines(added)),
            section("Changed", lines(changed)),
            section("Fixed", lines(fixed)),
        ]
            .filter(Boolean)
            .join("\n")
        return `## [${version || "version"}] - ${date || "YYYY-MM-DD"}\n\n${body || "- Add at least one shipped item.\n"}`
    }, [added, changed, date, fixed, version])

    async function copyNotes() {
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
                <h2>Changelog Generator</h2>
                <p>
                    Paste shipped work and generate customer-facing release notes in Keep a Changelog format.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Release</CardTitle>
                        <CardDescription>One line per item. Prefixes like - or * are stripped.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="version">Version</Label>
                                <Input id="version" value={version} onChange={(e) => setVersion(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="added">Added</Label>
                            <Textarea id="added" rows={3} value={added} onChange={(e) => setAdded(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="changed">Changed</Label>
                            <Textarea id="changed" rows={3} value={changed} onChange={(e) => setChanged(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fixed">Fixed</Label>
                            <Textarea id="fixed" rows={3} value={fixed} onChange={(e) => setFixed(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Generated notes</CardTitle>
                        <CardDescription>Copy into your changelog, blog, or release email.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <pre className="overflow-x-auto rounded-md border bg-muted p-3 text-sm whitespace-pre-wrap">{markdown}</pre>
                        <Button type="button" variant="outline" onClick={copyNotes}>
                            {copied ? "Copied" : "Copy markdown"}
                        </Button>
                    </CardContent>
                </Card>

                <ToolProductCta
                    title="Publish this as a Featul changelog"
                    description="Tie release notes to shipped roadmap items so voters get notified when their request ships."
                />
                <BackLink />
            </div>
        </div>
    )
}
