import { createAuthClient } from "better-auth/react"
import {
  inferOrgAdditionalFields,
  organizationClient,
  lastLoginMethodClient,
  twoFactorClient,
  multiSessionClient,
} from "better-auth/client/plugins"
import { emailOTPClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import { stripeClient } from "@better-auth/stripe/client"
import type { AuthServer } from "./auth"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    organizationClient({ schema: inferOrgAdditionalFields<AuthServer>() }),
    lastLoginMethodClient(),
    emailOTPClient(),
    passkeyClient(),
    twoFactorClient(),
    multiSessionClient(),
    stripeClient({ subscription: true }),
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
  multiSession,
} = authClient
