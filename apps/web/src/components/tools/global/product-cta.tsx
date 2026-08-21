"use client"

import Link from "next/link"
import { AUTH_SIGN_UP_URL } from "@/config/auth"
import { Button } from "@featul/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@featul/ui/components/card"

type ToolProductCtaProps = {
  title?: string
  description?: string
}

export default function ToolProductCta({
  title = "Run this inside Featul",
  description = "Collect votes on a feedback board, publish a public roadmap, and ship a changelog when the work is done.",
}: ToolProductCtaProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="space-y-1 tracking-wide">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href={AUTH_SIGN_UP_URL} data-sln-event="cta: tool signup clicked">
            Start for free
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
