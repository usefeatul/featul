import React from "react"
import ProfileSection from "./Profile"
import SecuritySection from "./Security"
import AppearanceSection from "./Appearance"
import DeleteAccount from "./DeleteAccount"
import type { PasskeyItem } from "./Passkeys"
import type { SessionItem } from "@/types/session"

type Props = {
  initialUser?: { name?: string; email?: string; image?: string | null } | null
  twoFactorEnabled?: boolean
  initialSessions?: SessionItem[]
  initialAccounts?: { id: string; accountId: string; providerId: string }[]
  initialPasskeys?: PasskeyItem[]
}

/** Single-page account settings: profile, security, appearance, then the danger zone. */
export default function AccountServer({ initialUser, twoFactorEnabled, initialSessions, initialAccounts, initialPasskeys }: Props) {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <ProfileSection initialUser={initialUser || undefined} initialAccounts={initialAccounts} initialPasskeys={initialPasskeys} />
      <SecuritySection initialSessions={initialSessions} initialAccounts={initialAccounts} twoFactorEnabled={twoFactorEnabled} />
      <AppearanceSection />
      <DeleteAccount />
    </section>
  )
}
