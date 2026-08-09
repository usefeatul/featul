"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@featul/ui/components/select"

const CTA_TEMPLATES: Record<string, { templates: string[]; tips: string[] }> = {
    signup: {
        templates: [
            "Start your free trial today",
            "Join {number}+ professionals already using {product}",
            "Get started in minutes — no credit card required",
            "Unlock your free account now",
            "Sign up and see results in 24 hours",
        ],
        tips: ["Emphasize 'free' and low commitment", "Include social proof with numbers", "Remove friction ('no credit card')"],
    },
    purchase: {
        templates: [
            "Buy now and save {percent}%",
            "Get {product} today — limited time offer",
            "Claim your discount before it expires",
            "Add to cart and check out securely",
            "Upgrade to Pro and unlock all features",
        ],
        tips: ["Create urgency with time limits", "Highlight savings and value", "Use secure/trust language"],
    },
    download: {
        templates: [
            "Download your free {resource} now",
            "Get instant access to the {resource}",
            "Grab your copy — it's 100% free",
            "Download the complete guide today",
            "Access the {resource} in seconds",
        ],
        tips: ["Emphasize 'instant' and 'free'", "Describe what they'll get", "Make the value clear upfront"],
    },
    learn: {
        templates: [
            "Discover how to {benefit}",
            "Learn the secrets of {topic}",
            "See how {product} can help you {benefit}",
            "Watch the demo and see it in action",
            "Read the full case study",
        ],
        tips: ["Focus on benefits, not features", "Use curiosity-driven language", "Promise specific outcomes"],
    },
    contact: {
        templates: [
            "Schedule a free consultation",
            "Talk to an expert today",
            "Get a personalized demo",
            "Request a custom quote",
            "Book your call — spots are limited",
        ],
        tips: ["Offer personalization", "Make it easy to take action", "Create mild urgency"],
    },
}

function getCtaScore(cta: string): { score: number; feedback: string[] } {
    let score = 50
    const feedback: string[] = []

    // Length check (ideal: 2-6 words)
    const words = cta.trim().split(/\s+/).length
    if (words >= 2 && words <= 6) {
        score += 15
        feedback.push("✓ Good length (2-6 words)")
    } else if (words < 2) {
        feedback.push("✗ Too short — add more context")
    } else {
        feedback.push("✗ Too long — keep it concise")
    }

    // Action verb check
    const actionVerbs = ["get", "start", "join", "download", "try", "discover", "learn", "claim", "unlock", "grab", "access", "buy", "save", "book", "schedule", "request", "see", "watch", "read", "sign"]
    const hasActionVerb = actionVerbs.some(verb => cta.toLowerCase().startsWith(verb))
    if (hasActionVerb) {
        score += 15
        feedback.push("✓ Starts with action verb")
    } else {
        feedback.push("✗ Start with an action verb")
    }

    // Power words check
    const powerWords = ["free", "now", "today", "instant", "exclusive", "limited", "save", "guaranteed"]
    const hasPowerWord = powerWords.some(word => cta.toLowerCase().includes(word))
    if (hasPowerWord) {
        score += 10
        feedback.push("✓ Contains power words")
    } else {
        feedback.push("○ Consider adding: free, now, today")
    }

    // First person check ("my", "your")
    if (cta.toLowerCase().includes("my") || cta.toLowerCase().includes("your")) {
        score += 10
        feedback.push("✓ Personal language (my/your)")
    }

    return { score: Math.min(100, score), feedback }
}

export default function CtaGeneratorTool() {
    const [goal, setGoal] = useState<keyof typeof CTA_TEMPLATES>("signup")
    const [product, setProduct] = useState<string>("our product")
    const [customCta, setCustomCta] = useState<string>("Start your free trial today")

    const templates = CTA_TEMPLATES[goal] || CTA_TEMPLATES.signup

    const generatedCtas = useMemo(() => {
        return templates?.templates.map(template =>
            template
                .replace("{product}", product)
                .replace("{resource}", "guide")
                .replace("{benefit}", "grow faster")
                .replace("{topic}", "success")
                .replace("{number}", "10,000")
                .replace("{percent}", "20")
        )
    }, [templates, product])

    const ctaAnalysis = useMemo(() => getCtaScore(customCta), [customCta])

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Call-to-Action Generator</h2>
                <p>
                    Generate effective CTAs based on your goal. Get templates, scoring, and tips to improve click-through rates.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">CTA Goal</CardTitle>
                        <CardDescription>What action do you want users to take?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="goal">Goal Type</Label>
                                <Select value={goal} onValueChange={setGoal}>
                                    <SelectTrigger id="goal">
                                        <SelectValue placeholder="Select goal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="signup">Sign Up / Register</SelectItem>
                                        <SelectItem value="purchase">Purchase / Buy</SelectItem>
                                        <SelectItem value="download">Download / Access</SelectItem>
                                        <SelectItem value="learn">Learn More / Explore</SelectItem>
                                        <SelectItem value="contact">Contact / Book</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product">Product/Brand Name</Label>
                                <Input
                                    id="product"
                                    value={product}
                                    onChange={(e) => setProduct(e.target.value)}
                                    placeholder="Your product name"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Generated CTAs</CardTitle>
                        <CardDescription>Click to copy any CTA template.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {generatedCtas?.map((cta, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        navigator.clipboard.writeText(cta)
                                        setCustomCta(cta)
                                    }}
                                    className="w-full text-left p-3 rounded-md border hover:border-primary hover:bg-primary/5 transition-colors"
                                >
                                    <span className="font-medium">{cta}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 p-3 rounded-md bg-zinc-50 dark:bg-zinc-900">
                            <h4 className="text-sm font-medium mb-2">Tips for {goal} CTAs:</h4>
                            <ul className="text-xs text-accent space-y-1">
                                {(templates?.tips ?? []).map((tip, i) => (
                                    <li key={i}>• {tip}</li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">CTA Analyzer</CardTitle>
                        <CardDescription>Score and improve your custom CTA.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="customCta">Your CTA</Label>
                                <Input
                                    id="customCta"
                                    value={customCta}
                                    onChange={(e) => setCustomCta(e.target.value)}
                                    placeholder="Enter your CTA text"
                                    className="text-lg"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-md border-2 border-primary/50 p-4 text-center">
                                    <div className="text-xs text-accent">CTA Score</div>
                                    <div className="mt-1 font-mono text-3xl font-bold text-foreground">{ctaAnalysis.score}</div>
                                    <div className="text-xs text-accent mt-1">out of 100</div>
                                </div>
                                <div className="rounded-md border p-4">
                                    <div className="text-xs text-accent mb-2">Feedback</div>
                                    <ul className="text-sm space-y-1">
                                        {ctaAnalysis.feedback.map((item, i) => (
                                            <li key={i} className={item.startsWith("✓") ? "text-green-600 dark:text-green-400" : item.startsWith("✗") ? "text-red-600 dark:text-red-400" : "text-accent"}>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>Writing Effective CTAs</h3>
                <p>
                    Great CTAs are clear, action-oriented, and create a sense of value or urgency.
                </p>

                <h4>CTA Best Practices</h4>
                <ul>
                    <li><strong>Start with a verb</strong> — "Get", "Start", "Join", "Download"</li>
                    <li><strong>Keep it short</strong> — 2-6 words is ideal</li>
                    <li><strong>Create urgency</strong> — "Today", "Now", "Limited time"</li>
                    <li><strong>Be specific</strong> — Tell them exactly what happens next</li>
                    <li><strong>Use first person</strong> — "Start my free trial" "Start your free trial"</li>
                </ul>
            </section>
        </div>
    )
}
