import { createAuthClient } from "better-auth/react"
import {
  inferOrgAdditionalFields,
  organizationClient,
  lastLoginMethodClient,
  twoFactorClient,
} from "better-auth/client/plugins"
import { emailOTPClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import type { AuthServer } from "./auth"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    organizationClient({ schema: inferOrgAdditionalFields<AuthServer>() }),
    lastLoginMethodClient(),
    emailOTPClient(),
    passkeyClient(),
    twoFactorClient(),
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
  passkey,
} = authClient

