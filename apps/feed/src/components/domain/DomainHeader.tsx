"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@feedgot/ui/components/button"
import { cn } from "@feedgot/ui/lib/utils"
import { MobileBoardsMenu } from "./MobileBoardsMenu"
import { CommentsIcon } from "@feedgot/ui/icons/comments"
import { RoadmapIcon } from "@feedgot/ui/icons/roadmap"
import { ChangelogIcon } from "@feedgot/ui/icons/changelog"

type WorkspaceInfo = {
  id: string
  name: string
  slug: string
  domain: string | null
  logo: string | null
}

export function DomainHeader({ workspace, subdomain }: { workspace: WorkspaceInfo; subdomain: string }) {
  const pathname = usePathname() || ""
  const feedbackBase = `/`
  const roadmapBase = `/roadmap`
  const changelogBase = `/changelog`
  const isFeedback = pathname === "/"
  const isRoadmap = pathname.startsWith(roadmapBase)
  const isChangelog = pathname.startsWith(changelogBase)
  const itemCls = (active: boolean) => cn("rounded-md border px-3 py-2", active ? "bg-background/50 border-accent/20" : "border-transparent hover:bg-muted")
  return (
    <header className={cn("py-3 sm:py-5")}>      
      <div className="md:hidden grid grid-cols-[1fr_auto_1fr] items-center w-full">
        <div className="justify-self-start">
          <MobileBoardsMenu slug={workspace.slug} subdomain={subdomain} />
        </div>
        <div className="inline-flex items-center justify-center justify-self-center">
          {workspace.logo ? (
            <Image src={workspace.logo} alt={workspace.name} width={32} height={32} className="rounded-sm object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-sm bg-muted flex items-center justify-center text-md font-semibold">
              {workspace.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 justify-self-end">
          <Button asChild size="xs" variant="nav">
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="xs" variant="nav" className="bg-primary text-primary-foreground hover:bg-primary/90 ring-ring/60 hover:ring-ring">
            <Link href="/auth/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-1 w-full">      
        <div className="flex items-center gap-1">
          {workspace.logo ? (
            <Image src={workspace.logo} alt={workspace.name} width={32} height={32} className="rounded-sm object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-sm bg-muted flex items-center justify-center text-md font-semibold">
              {workspace.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="text-md font-medium">{workspace.name}</div>
        </div>
        <span className="mx-2 text-accent" aria-hidden>|</span>

        <nav className="flex-1">
          <ul className="flex items-center gap-3 text-sm">
            <li>
            <Link href={feedbackBase} className={itemCls(isFeedback)} aria-current={isFeedback ? "page" : undefined}>
              <span className="inline-flex items-center gap-2">
                Feedback
                <CommentsIcon size={16} className="text-accent" />
              </span>
            </Link>
          </li>
          <li>
            <Link href={roadmapBase} className={itemCls(isRoadmap)} aria-current={isRoadmap ? "page" : undefined}>
              <span className="inline-flex items-center gap-2">
                Roadmap
                <RoadmapIcon size={16} className="text-accent" />
              </span>
            </Link>
          </li>
          <li>
            <Link href={changelogBase} className={itemCls(isChangelog)} aria-current={isChangelog ? "page" : undefined}>
              <span className="inline-flex items-center gap-2">
                Changelog
                <ChangelogIcon size={16} className="text-accent" />
              </span>
            </Link>
          </li>
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild size="xs" variant="nav">
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="xs" variant="nav" className="bg-primary text-primary-foreground hover:bg-primary/90 ring-ring/60 hover:ring-ring">
            <Link href="/auth/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
