"use client"

import { useSession } from "@featul/auth/client"
import { useEffect, useRef } from "react"
import {
  identifyAnalyticsUser,
  resetAnalyticsUser,
} from "@/lib/posthog"

export function PostHogIdentifier() {
  const { data: session } = useSession()
  const lastIdentifiedUserId = useRef<string | null>(null)

  useEffect(() => {
    const userId = session?.user?.id

    if (userId) {
      identifyAnalyticsUser({
        id: userId,
        email: session.user.email,
        name: session.user.name,
      })
      lastIdentifiedUserId.current = userId
      return
    }

    if (lastIdentifiedUserId.current) {
      resetAnalyticsUser()
      lastIdentifiedUserId.current = null
    }
  }, [session?.user?.email, session?.user?.id, session?.user?.name])

  return null
}
