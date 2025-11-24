"use client"

import React from "react"
import { useRouter, useParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@feedgot/ui/components/tabs"
import SettingsHeader from "./Header"
import BrandingSection from "../branding/Branding"
import TeamSection from "../billing/Team"
import FeedbackSection from "../feedback/Feedback"
import ChangelogSection from "../changelog/Changelog"
import BillingSection from "../billing/Billing"
import DomainSection from "../domain/Domain"
import IntegrationsSection from "../integrations/Integrations"
import SSOSection from "../sso/SSO"
import DataSection from "../data/Data"
import { SECTIONS } from "../../../config/sections"

type Props = { slug: string }

const sections = SECTIONS

export default function SettingsTabs({ slug }: Props) {
  const router = useRouter()
  const routeParams = useParams()
  const paramSection = typeof routeParams?.section === "string" ? routeParams.section : undefined
  const value = paramSection || sections[0]?.value

  const onValueChange = (v: string) => {
    const url = `/workspaces/${slug}/settings/${encodeURIComponent(v)}`
    router.replace(url)
  }

  React.useEffect(() => {
    if (!paramSection && value) {
      router.replace(`/workspaces/${slug}/settings/${encodeURIComponent(value)}`)
    }
  }, [paramSection, value])

  React.useEffect(() => {
    sections.forEach((s) => {
      router.prefetch(`/workspaces/${slug}/settings/${encodeURIComponent(s.value)}`)
    })
  }, [router, slug])

  return (
    <section className="p-3 space-y-4">
      <SettingsHeader title="Settings" description="View and manage your workspace settings." />
      <Tabs value={value} onValueChange={onValueChange} className="space-y-4">
        <TabsList className="w-full flex-wrap">
          {sections.map((s) => (
            <TabsTrigger key={s.value} value={s.value} className="min-h-[36px] px-3 text-accent">{s.label}</TabsTrigger>
          ))}
        </TabsList>

        {sections.map((s) => (
          <TabsContent key={s.value} value={s.value} className="mt-2">
            <SectionRenderer slug={slug} section={s.value} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}

function SectionRenderer({ slug, section }: { slug: string; section: string }) {
  switch (section) {
    case "branding":
      return <BrandingSection slug={slug} />
    case "team":
      return <TeamSection slug={slug} />
    case "feedback":
      return <FeedbackSection />
    case "changelog":
      return <ChangelogSection />
    case "billing":
      return <BillingSection />
    case "domain":
      return <DomainSection />
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
