"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@feedgot/ui/components/button"
import { cn } from "@feedgot/ui/lib/utils"

type WorkspaceInfo = {
  id: string
  name: string
  slug: string
  domain: string | null
  logo: string | null
}

export function DomainHeader({ workspace, subdomain }: { workspace: WorkspaceInfo; subdomain: string }) {
  const pathname = usePathname() || ""
  const base = `/${subdomain}/${workspace.slug}`
  const isFeedback = pathname.startsWith(base) && !pathname.startsWith(`${base}/roadmap`) && !pathname.startsWith(`${base}/changelog`)
  const isRoadmap = pathname.startsWith(`${base}/roadmap`)
  const isChangelog = pathname.startsWith(`${base}/changelog`)
  const itemCls = (active: boolean) => cn("rounded-md border px-3 py-2", active ? "bg-muted" : "border-transparent hover:bg-muted")
  return (
    <header className={cn("flex items-center gap-2 py-4 sm:py-6")}>      
      <div className="flex items-center gap-3">
        {workspace.logo ? (
          <Image src={workspace.logo} alt={workspace.name} width={32} height={32} className="rounded-sm object-cover" />
        ) : (
          <div className="h-9 w-9 rounded-sm bg-muted flex items-center justify-center text-md font-semibold">
            {workspace.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="text-md font-medium">{workspace.name}</div>
      </div>

      <nav className="flex-1">
        <ul className="flex items-center gap-3 text-sm">
          <li>
            <Link href={base} className={itemCls(isFeedback)} aria-current={isFeedback ? "page" : undefined}>Feedback</Link>
          </li>
          <li>
            <Link href={`${base}/roadmap`} className={itemCls(isRoadmap)} aria-current={isRoadmap ? "page" : undefined}>Roadmap</Link>
          </li>
          <li>
            <Link href={`${base}/changelog`} className={itemCls(isChangelog)} aria-current={isChangelog ? "page" : undefined}>Changelog</Link>
          </li>
        </ul>
      </nav>

      <div className="flex items-center gap-3">
        <Button asChild size="xs" variant="outline">
          <Link href="/auth/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="xs">
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      </div>
    </header>
  )
}
