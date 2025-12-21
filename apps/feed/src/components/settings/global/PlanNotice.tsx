"use client"

import React from "react"
import { AccentBar } from "@oreilla/ui/components/cardElements"
import { cn } from "@oreilla/ui/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { client } from "@oreilla/api/client"
import { normalizePlan, getPlanLimits, type PlanKey, type PlanLimits } from "@/lib/plan"

type Feature = "branding" | "team" | "domain" | "tags" | "changelog_tags" | "boards"

function buildMessage(feature: Feature, plan: PlanKey, limits: PlanLimits, counts?: { members?: number; tags?: number; changelogTags?: number; boards?: number }) {
  if (feature === "branding") {
    if (!limits.allowBranding) return { title: "Branding is available on paid plans", detail: "Upgrade to Starter or Professional" }
    if (limits.allowHidePoweredBy) return { title: "Branding unlocked", detail: "You can hide 'Powered by' in this plan" }
    return { title: "Branding enabled", detail: "Some options are limited on this plan" }
  }
  if (feature === "domain") {
    if (plan === "free") return { title: "Custom domain available on Starter or Professional" }
    return { title: "Custom domain included in your plan" }
  }
  if (feature === "team") {
    if (typeof limits.maxMembers === "number") {
      const used = counts?.members ?? 0
      return { title: `Up to ${limits.maxMembers} members`, detail: `${used} currently in workspace` }
    }
    if (limits.maxMembers == null) return { title: "Unlimited members" }
  }
  
  if (feature === "tags") {
    if (typeof limits.maxTags === "number") {
      const used = counts?.tags ?? 0
      return { title: `Up to ${limits.maxTags} tags`, detail: `${used} currently in workspace` }
    }
    if (limits.maxTags == null) return { title: "Unlimited tags" }
  }
  if (feature === "changelog_tags") {
    if (typeof limits.maxChangelogTags === "number") {
      const used = counts?.changelogTags ?? 0
      return { title: `Up to ${limits.maxChangelogTags} changelog tags`, detail: `${used} currently on changelog` }
    }
    if (limits.maxChangelogTags == null) return { title: "Unlimited changelog tags" }
  }
  if (feature === "boards") {
    if (typeof limits.maxNonSystemBoards === "number") {
      const used = counts?.boards ?? 0
      return { title: `Up to ${limits.maxNonSystemBoards} boards`, detail: `${used} currently in workspace` }
    }
    if (limits.maxNonSystemBoards == null) return { title: "Unlimited boards" }
  }
  return { title: `Your plan: ${plan}` }
}

export default function PlanNotice({ slug, feature, className, plan: rawPlan, membersCount, tagsCount, changelogTagsCount, boardsCount }: { slug: string; feature: Feature; className?: string; plan?: string; membersCount?: number; tagsCount?: number; changelogTagsCount?: number; boardsCount?: number }) {
  const { data } = useQuery({
    queryKey: ["workspace-plan", slug],
    queryFn: async () => {
      const res = await client.workspace.bySlug.$get({ slug })
      const d = await res.json()
      return String((d as { workspace?: { plan?: string } })?.workspace?.plan || "free")
    },
    enabled: !rawPlan,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const plan = normalizePlan(rawPlan || data || "free")
  const limits = getPlanLimits(plan)
  const msg = buildMessage(feature, plan, limits, { members: membersCount, tags: tagsCount, changelogTags: changelogTagsCount, boards: boardsCount })
  return (
    <div className={cn("rounded-mdborder bg-muted/50 text-foreground text-xs sm:text-sm px-2 py-2 flex items-center gap-2", className)}>
      <AccentBar width={6} height={30} className="shrink-0" />
      <div className="leading-tight">
        <div className="font-medium">{msg.title}</div>
        {msg.detail ? <div className="text-accent">{msg.detail}</div> : null}
      </div>
    </div>
  )
}
