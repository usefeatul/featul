"use client"

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
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

type Props = { slug: string }

const sections = [
  { value: "branding", label: "Branding", desc: "Customize logo and identity" },
  { value: "team", label: "Team", desc: "Manage members and roles" },
  { value: "feedback", label: "Feedback", desc: "Configure boards and feedback" },
  { value: "changelog", label: "Changelog", desc: "Manage product updates" },
  { value: "billing", label: "Billing", desc: "Subscriptions and invoices" },
  { value: "domain", label: "Domain", desc: "Custom domain settings" },
  { value: "integrations", label: "Integrations", desc: "Connect external tools" },
  { value: "sso", label: "SSO", desc: "Single sign-on setup" },
  { value: "data", label: "Data", desc: "Export and data controls" },
]

export default function SettingsTabs({ slug }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const initial = params?.get("tab") || sections[0]?.value
  const [value, setValue] = React.useState(initial)

  React.useEffect(() => {
    const q = params.get("tab")
    if (q && q !== value) setValue(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const onValueChange = (v: string) => {
    setValue(v)
    const base = `/workspaces/${slug}/settings`
    const url = `${base}?tab=${encodeURIComponent(v)}`
    router.replace(url)
  }

  return (
    <section className="p-6 space-y-4">
      <SettingsHeader title="Settings" description="View and manage your workspace settings." />
      <Tabs value={value} onValueChange={onValueChange} className="space-y-4">
        <TabsList className="w-full flex-wrap">
          {sections.map((s) => (
            <TabsTrigger key={s.value} value={s.value}>{s.label}</TabsTrigger>
          ))}
        </TabsList>

        {sections.map((s) => (
          <TabsContent key={s.value} value={s.value} className="mt-2">
            <SectionRenderer slug={slug} section={s.value} description={s.desc} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}

function SectionRenderer({ slug, section, description }: { slug: string; section: string; description: string }) {
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
