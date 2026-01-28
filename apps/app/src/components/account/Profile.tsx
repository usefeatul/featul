"use client"

import SectionCard from "@/components/settings/global/SectionCard"
import OAuthConnections from "./OAuthConnections"
import DeleteAccount from "./DeleteAccount"
import AvatarUpload from "./AvatarUpload"
import AccountDetails from "./AccountDetails"
import type { PasskeyItem } from "./Passkeys"

type ProfileProps = {
  initialUser?: { name?: string; email?: string; image?: string | null } | null
  initialAccounts?: { id: string; accountId: string; providerId: string }[]
  initialPasskeys?: PasskeyItem[]
}

export default function Profile({ initialUser, initialAccounts, initialPasskeys }: ProfileProps) {
  return (
    <SectionCard
      title="Profile"
      description="Manage your account settings and connected services"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AvatarUpload initialUser={initialUser} />
        <AccountDetails initialUser={initialUser} initialPasskeys={initialPasskeys} />
        <OAuthConnections initialAccounts={initialAccounts} />
        <DeleteAccount />
      </div>
    </SectionCard>
  )
}
