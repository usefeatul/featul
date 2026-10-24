import { createAuthClient } from "better-auth/react"
import {
  lastLoginMethodClient,
  twoFactorClient,
  multiSessionClient,
} from "better-auth/client/plugins"
import { emailOTPClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import { stripeClient } from "@better-auth/stripe/client"

/**
 * Tenant subdomains call their own origin: the session cookie is shared across the parent
 * domain, and the app only grants credentialed CORS to its exact origins. Local dev has no
 * shared cookie domain, so *.localhost keeps calling the app.
 */
function getAuthBaseUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  if (typeof window === "undefined") return appUrl
  const { hostname, origin } = window.location
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost")) return appUrl
  return origin
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
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
