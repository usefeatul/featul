"use client"

import Link from "next/link"
import { Button } from "@feedgot/ui/components/button"
import { Container } from "@/components/container"
import Tabs from "@/components/boards/Tabs"

export default function WorkspaceHeader({ name, slug, activeTab, hrefBase, className = "" }: { name: string; slug: string; activeTab: "issues" | "roadmap" | "changelog"; hrefBase?: string; className?: string }) {

  return (
    <header className={`bg-muted/50 border-b border-zinc-200 dark:border-zinc-800 ${className}`}>
      <Container maxWidth="5xl" className="py-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="size-7 rounded-full bg-muted" />
              <div>
                <div className="text-base sm:text-lg font-semibold">{name}</div>
                <div className="text-xs text-accent">{slug}.feedgot.com</div>
              </div>
            </div>
            <Tabs active={activeTab} hrefBase={hrefBase} className="mt-0 border-none flex gap-6" />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/sign-in"><Button variant="outline" size="sm">Sign in</Button></Link>
            <Link href="/auth/sign-up"><Button size="sm">Sign up</Button></Link>
          </div>
        </div>
      </Container>
    </header>
  )
}
