import React from "react"
import AccountTabsHeader from "./AccountTabsHeader"
import ProfileSection from "./Profile"
import SecuritySection from "./Security"
import AppearanceSection from "./Appearance"
import { ACCOUNT_SECTIONS } from "@/config/account-sections"
import type { PasskeyItem } from "./Passkeys"
import type { SessionItem } from "@/types/session"

type Props = {
  slug: string
  selectedSection?: string
  initialUser?: { name?: string; email?: string; image?: string | null } | null
  twoFactorEnabled?: boolean
  initialSessions?: SessionItem[]
  initialAccounts?: { id: string; accountId: string; providerId: string }[]
  initialPasskeys?: PasskeyItem[]
}

export default function AccountServer({ slug, selectedSection, initialUser, twoFactorEnabled, initialSessions, initialAccounts, initialPasskeys }: Props) {
  const sections = ACCOUNT_SECTIONS
  const defaultSection = sections[0]?.value || "profile"
  const selected = typeof selectedSection === "string" && sections.some((section) => section.value === selectedSection)
    ? selectedSection
    : defaultSection
  return (
    <section className="space-y-4">
      <AccountTabsHeader slug={slug} selected={selected} />
      <div className="mt-2">
        <SectionRenderer section={selected} initialUser={initialUser || undefined} twoFactorEnabled={twoFactorEnabled} initialSessions={initialSessions} initialAccounts={initialAccounts} initialPasskeys={initialPasskeys} />
      </div>
    </section>
  )
}

function SectionRenderer({ section, initialUser, twoFactorEnabled, initialSessions, initialAccounts, initialPasskeys }: { section: string; initialUser?: { name?: string; email?: string; image?: string | null }; twoFactorEnabled?: boolean; initialSessions?: SessionItem[]; initialAccounts?: { id: string; accountId: string; providerId: string }[]; initialPasskeys?: PasskeyItem[] }) {
  switch (section) {
    case "profile":
      return <ProfileSection initialUser={initialUser} initialAccounts={initialAccounts} initialPasskeys={initialPasskeys} />
    case "security":
      return <SecuritySection initialSessions={initialSessions} initialAccounts={initialAccounts} twoFactorEnabled={twoFactorEnabled} />
    case "appearance":
      return <AppearanceSection />
    default:
      return <ProfileSection initialUser={initialUser} initialAccounts={initialAccounts} initialPasskeys={initialPasskeys} />
  }
}
