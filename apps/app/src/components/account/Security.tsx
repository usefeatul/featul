"use client"

import React from "react"
import { useRouter, usePathname } from "next/navigation"
import SectionCard from "@/components/settings/global/SectionCard"
import SettingsCard from "@/components/global/SettingsCard"
import { KeyIcon } from "@featul/ui/icons/key"
import TwoFactorAuth from "@/components/account/TwoFactorAuth"
import ActiveSessions from "@/components/account/ActiveSessions"
import type { SessionItem } from "@/types/session"

export default function Security({ initialSessions, twoFactorEnabled, initialAccounts }: { initialSessions?: SessionItem[] | null; twoFactorEnabled?: boolean; initialAccounts?: { id: string; accountId: string; providerId: string }[] }) {
  const router = useRouter()
  const pathname = usePathname() || "/"

  // Check if user has a password-based account (credential provider)
  const hasPassword = initialAccounts?.some(acc => acc.providerId === "credential") ?? false

  const onChangePassword = React.useCallback(() => {
    const redirect = encodeURIComponent(pathname)
    router.push(`/auth/forgot-password?redirect=${redirect}`)
  }, [router, pathname])

  return (
    <SectionCard title="Security" description="Manage your password and active sessions">
      <div className="space-y-4">
        {/* Password and 2FA cards in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsCard
            icon={<KeyIcon className="size-5 text-primary" />}
            title="Password"
            description="Change your account password for security."
            buttonLabel="Change password"
            onAction={onChangePassword}
          />
          <TwoFactorAuth twoFactorEnabled={twoFactorEnabled} hasPassword={hasPassword} />
        </div>

        {/* Active Sessions */}
        <ActiveSessions initialSessions={initialSessions} />
      </div>
    </SectionCard>
  )
}
