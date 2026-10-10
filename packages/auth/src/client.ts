import { createAuthClient } from "better-auth/react"
import {
  lastLoginMethodClient,
  twoFactorClient,
  multiSessionClient,
} from "better-auth/client/plugins"
import { emailOTPClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import { stripeClient } from "@better-auth/stripe/client"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
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
  passkey,
  multiSession,
} = authClient
