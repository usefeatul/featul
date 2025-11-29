"use client"

import React from "react"
import { useRouter, useParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@feedgot/ui/components/tabs"
import BrandingSection from "../branding/Branding"
import TeamSection from "../team/Team"
import FeedbackSection from "../feedback/Feedback"
import ChangelogSection from "../changelog/Changelog"
import BillingSection from "../billing/Billing"
import DomainSection from "../domain/Domain"
import IntegrationsSection from "../integrations/Integrations"
import SSOSection from "../sso/SSO"
import DataSection from "../data/Data"
import type { Member, Invite } from "../team/team"
import { SECTIONS } from "../../../config/sections"

type Props = { slug: string; initialTeam?: { members: Member[]; invites: Invite[]; meId: string | null }; selectedSection?: string }

const sections = SECTIONS

export default function SettingsTabs({ slug, initialTeam, selectedSection }: Props) {
  const router = useRouter()
  const routeParams = useParams()
  const paramSection = typeof routeParams?.section === "string" ? routeParams.section : undefined
  const selected = selectedSection || paramSection || sections[0]?.value

  const onValueChange = React.useCallback((v: string) => {
    const url = `/workspaces/${slug}/settings/${encodeURIComponent(v)}`
    router.replace(url)
  }, [router, slug])

  React.useEffect(() => {
    if (!paramSection && selected) {
      router.replace(`/workspaces/${slug}/settings/${encodeURIComponent(selected)}`)
    }
  }, [paramSection, selected, slug, router])

  React.useEffect(() => {
    sections.forEach((s) => {
      router.prefetch(`/workspaces/${slug}/settings/${encodeURIComponent(s.value)}`)
    })
  }, [router, slug])

  return (
    <section className="space-y-4">
      <Tabs value={selected} onValueChange={onValueChange} className="space-y-4">
        <TabsList className="w-full">
          {sections.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="min-h-[36px] px-3 text-accent">{item.label}</TabsTrigger>
          ))}
        </TabsList>

        {sections.map((s) => (
          <TabsContent key={s.value} value={s.value} className="mt-2">
            <SectionRenderer slug={slug} section={s.value} initialTeam={initialTeam} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}

function SectionRenderer({ slug, section, initialTeam }: { slug: string; section: string; initialTeam?: { members: Member[]; invites: Invite[]; meId: string | null } }) {
  switch (section) {
    case "branding":
      return <BrandingSection slug={slug} />
    case "team":
      return <TeamSection slug={slug} initialMembers={initialTeam?.members} initialInvites={initialTeam?.invites} initialMeId={initialTeam?.meId} />
    case "feedback":
      return <FeedbackSection />
    case "changelog":
      return <ChangelogSection />
    case "billing":
      return <BillingSection />
    case "domain":
      return <DomainSection slug={slug} />
    case "integrations":
      return <IntegrationsSection />
    case "sso":
      return <SSOSection />
    case "data":
      return <DataSection />
    default:
      return <div className="bg-card rounded-md border p-4">Unknown section</div>
  }
}
