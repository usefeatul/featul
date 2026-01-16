import React from "react"
import AccountTabsHeader from "./AccountTabsHeader"
import ProfileSection from "./Profile"
import SecuritySection from "./Security"
import NotificationsSection from "./Notifications"
import AppearanceSection from "./Appearance"
import { ACCOUNT_SECTIONS } from "@/config/account-sections"

type Props = {
  slug: string
  selectedSection?: string
  initialUser?: { name?: string; email?: string; image?: string | null } | null
  initialMeSession?: any
  initialSessions?: { token: string; userAgent?: string | null; ipAddress?: string | null; createdAt?: string; expiresAt?: string }[]
  initialAccounts?: { id: string; accountId: string; providerId: string }[]
}

export default function AccountServer({ slug, selectedSection, initialUser, initialMeSession, initialSessions, initialAccounts }: Props) {
  const sections = ACCOUNT_SECTIONS
  const selected: string = typeof selectedSection === "string" && selectedSection ? selectedSection : (sections[0]?.value || "profile")
  return (
    <section className="space-y-4">
      <AccountTabsHeader slug={slug} selected={selected} />
      <div className="mt-2">
        <SectionRenderer section={selected} initialUser={initialUser || undefined} initialMeSession={initialMeSession} initialSessions={initialSessions} initialAccounts={initialAccounts} />
      </div>
    </section>
  )
}

function SectionRenderer({ section, initialUser, initialMeSession, initialSessions, initialAccounts }: { section: string; initialUser?: { name?: string; email?: string; image?: string | null }; initialMeSession?: any; initialSessions?: { token: string; userAgent?: string | null; ipAddress?: string | null; createdAt?: string; expiresAt?: string }[]; initialAccounts?: { id: string; accountId: string; providerId: string }[] }) {
  switch (section) {
    case "profile":
      return <ProfileSection initialUser={initialUser} initialAccounts={initialAccounts} />
    case "security":
      return <SecuritySection initialMeSession={initialMeSession} initialSessions={initialSessions} />
    case "notifications":
      return <NotificationsSection />
    case "appearance":
      return <AppearanceSection />
    default:
      return <div className="bg-card rounded-md  border p-4">Unknown section</div>
  }
}
