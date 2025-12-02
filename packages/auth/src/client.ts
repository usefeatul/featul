import { createAuthClient } from "better-auth/react"
import {
  inferOrgAdditionalFields,
  organizationClient,
  lastLoginMethodClient,
} from "better-auth/client/plugins"
import { emailOTPClient } from "better-auth/client/plugins"
import type { AuthServer } from "./auth"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  fetch: async (url: string, init?: any) => {
    const next = { ...(init || {}), credentials: "include" as const }
    return fetch(url, next)
  },
  plugins: [
    organizationClient({ schema: inferOrgAdditionalFields<AuthServer>() }),
    lastLoginMethodClient(),
    emailOTPClient(),
  ],
})

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  getSession,
  organization,
  useListOrganizations,
  useActiveOrganization,
} = authClient
