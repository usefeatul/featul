"use client"

import React from "react"
import { useRouter, usePathname } from "next/navigation"
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
    router.push(`/auth/forgot?redirect=${redirect}`)
  }, [router, pathname])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:auto-rows-fr md:items-stretch">
        <SettingsCard
          icon={<KeyIcon className="size-5 text-primary" />}
          title="Password"
          description="Change your account password for security."
          buttonLabel="Change password"
          onAction={onChangePassword}
        />
        <TwoFactorAuth twoFactorEnabled={twoFactorEnabled} hasPassword={hasPassword} />
      </div>
      <ActiveSessions initialSessions={initialSessions} />
    </div>
  )
}
