"use client"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@feedgot/ui/components/card"
import { Button } from "@feedgot/ui/components/button"
import { cn } from "@feedgot/ui/lib/utils"

type PromoCardProps = {
  className?: string
  title?: string
  description?: string
  ctaHref?: string
  ctaLabel?: string
  subtext?: string
}

export function PromoCard({
  className,
  title = "Feedgot, Simplified",
  description = "Stop guessing. Get actionable feedback understand what users need, iterate faster, and ship with confidence.",
  ctaHref = "/signup",
  ctaLabel = "Sign up for Feedgot",
  subtext = "free to start, no cc required",
}: PromoCardProps) {
  return (
    <div className={cn("w-full", className)}>
      <Card className="">
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-semibold text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="mt-1 text-xs text-zinc-500">
            {description}
          </CardDescription>
          <div className="mt-1">
            <Button asChild className="w-full">
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
      <p className="mt-2 text-center text-[11px] text-zinc-500">{subtext}</p>
    </div>
  )
}