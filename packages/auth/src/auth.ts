import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { organization, lastLoginMethod, emailOTP, twoFactor, multiSession } from "better-auth/plugins"
import { passkey } from "@better-auth/passkey"
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth"
import { Polar } from "@polar-sh/sdk"
import { db, user, session, account, verification, passkeyTable, twoFactorTable } from "@featul/db"
import { sendVerificationOtpEmail, sendWelcome } from "./email"
import { createAuthEndpoint, createAuthMiddleware, APIError, sessionMiddleware } from "better-auth/api"
import { getPasswordError } from "./password"
import { syncPolarSubscription } from "./polar"
import { getValidatedTrustedOrigins } from "./trusted-origins"
import { setSessionCookie } from "better-auth/cookies"
import { getAuthRateLimitStorage } from "./rate-limit-storage"

function resolveCookieDomain() {
  const explicit = (process.env.AUTH_COOKIE_DOMAIN || "").trim()
  if (explicit) {
    if (explicit === "localhost" || explicit === "127.0.0.1") return ""
    return explicit
  }
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").trim()
  if (!appUrl) return ""
  try {
    const hostname = new URL(appUrl).hostname
    if (hostname === "localhost" || hostname === "127.0.0.1") return ""
    const parts = hostname.split(".").filter(Boolean)
    if (parts.length < 2) return ""
    return `.${parts.slice(-2).join(".")}`
  } catch {
    return ""
  }
}

const cookieDomain = resolveCookieDomain()
const trustedOrigins = getValidatedTrustedOrigins("AUTH_TRUSTED_ORIGINS")
const authRateLimitStorage = getAuthRateLimitStorage()

const multiSessionBootstrapPlugin = {
  id: "multi-session-bootstrap",
  endpoints: {
    bootstrapCurrentDeviceSession: createAuthEndpoint(
      "/multi-session/bootstrap-current",
      {
        method: "POST",
        requireHeaders: true,
        use: [sessionMiddleware],
      },
      async (ctx) => {
        if (!ctx.context.session?.session?.token || !ctx.context.session?.user) {
          throw new APIError("UNAUTHORIZED")
        }

        // Re-issue the current session cookie so multi-session hooks can seed
        // a missing per-device cookie for legacy sessions.
        await setSessionCookie(ctx, ctx.context.session as any)

        return ctx.json({ success: true })
      },
    ),
  },
}

const polarAccessToken = (process.env.POLAR_ACCESS_TOKEN || "").trim()
const polarWebhookSecret = (process.env.POLAR_WEBHOOK_SECRET || "").trim()
const polarServer =
  process.env.POLAR_SERVER === "production" ? "production" : "sandbox"
const polarStarterMonthly =
  (process.env.POLAR_PRODUCT_ID_STARTER_MONTHLY || "").trim() ||
  (process.env.POLAR_PRODUCT_ID_MONTHLY || "").trim()
const polarStarterYearly =
  (process.env.POLAR_PRODUCT_ID_STARTER_YEARLY || "").trim() ||
  (process.env.POLAR_PRODUCT_ID_YEARLY || "").trim()
const polarProfessionalMonthly = (process.env.POLAR_PRODUCT_ID_PROFESSIONAL_MONTHLY || "").trim()
const polarProfessionalYearly = (process.env.POLAR_PRODUCT_ID_PROFESSIONAL_YEARLY || "").trim()

const polarCheckoutProducts = [
  polarStarterMonthly
    ? { productId: polarStarterMonthly, slug: "starter-monthly" }
    : null,
  polarStarterYearly
    ? { productId: polarStarterYearly, slug: "starter-yearly" }
    : null,
  polarProfessionalMonthly
    ? { productId: polarProfessionalMonthly, slug: "professional-monthly" }
    : null,
  polarProfessionalYearly
    ? { productId: polarProfessionalYearly, slug: "professional-yearly" }
    : null,
].filter(Boolean) as { productId: string; slug: string }[]

const polarClient = polarAccessToken
  ? new Polar({ accessToken: polarAccessToken, server: polarServer })
  : null
const polarUse: Array<
  | ReturnType<typeof checkout>
  | ReturnType<typeof portal>
  | ReturnType<typeof usage>
  | ReturnType<typeof webhooks>
> = [
  checkout({
    products: polarCheckoutProducts.length > 0 ? polarCheckoutProducts : undefined,
    successUrl: "/start?checkout_id={CHECKOUT_ID}",
    authenticatedUsersOnly: true,
  }),
  portal(),
  usage(),
]

if (polarClient && polarWebhookSecret) {
  polarUse.push(
    webhooks({
      secret: polarWebhookSecret,
      onSubscriptionCreated: async (payload) => {
        await syncPolarSubscription(payload.data)
      },
      onSubscriptionUpdated: async (payload) => {
        await syncPolarSubscription(payload.data)
      },
      onSubscriptionActive: async (payload) => {
        await syncPolarSubscription(payload.data)
      },
      onSubscriptionCanceled: async (payload) => {
        await syncPolarSubscription(payload.data)
      },
      onSubscriptionUncanceled: async (payload) => {
        await syncPolarSubscription(payload.data)
      },
      onSubscriptionRevoked: async (payload) => {
        await syncPolarSubscription(payload.data)
      },
    })
  )
}

const polarPlugin = polarClient
  ? polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: polarUse as [
        ReturnType<typeof checkout>,
        ...Array<
          | ReturnType<typeof checkout>
          | ReturnType<typeof portal>
          | ReturnType<typeof usage>
          | ReturnType<typeof webhooks>
        >
      ],
    })
  : null



export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
      passkey: passkeyTable,
      twoFactor: twoFactorTable,
    },
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      prompt: "select_account",
    },
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: Boolean(cookieDomain),
      domain: cookieDomain || undefined,
    },
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for", "x-real-ip"],
      ipv6Subnet: 64,
    },
  },

  trustedOrigins,

  rateLimit: {
    customStorage: authRateLimitStorage,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 300, max: 3 },
      "/reset-password": { window: 300, max: 5 },
      "/email-otp/send-verification-otp": { window: 60, max: 5 },
      "/email-otp/request-password-reset": { window: 300, max: 3 },
      "/email-otp/reset-password": { window: 300, max: 5 },
      "/two-factor/verify-otp": { window: 60, max: 5 },
      "/two-factor/verify-totp": { window: 60, max: 5 },
      "/two-factor/verify-backup-code": { window: 60, max: 5 },
      "/passkey/verify-authentication": { window: 60, max: 10 },
    },
  },

  plugins: [
    organization(),
    lastLoginMethod(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        await sendVerificationOtpEmail(email, otp, type)
      },
    }),
    passkey({
      rpID: process.env.PASSKEY_RP_ID || "localhost",
      rpName: process.env.PASSKEY_RP_NAME || "Featul",
      origin: process.env.PASSKEY_ORIGIN || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    }),
    twoFactor({
      issuer: "Featul",
    }),
    multiSession(),
    multiSessionBootstrapPlugin,
    ...(polarPlugin ? [polarPlugin] : []),
  ],

  databaseHooks: {
    user: {
      create: {
        after: async (created) => {
          const to = String(created.email || "")
          if (!to) return
          const name = String(created.name || "") || undefined
          try {
            await sendWelcome(to, name)
          } catch (e) { }
        },
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const isPasswordOp = ctx.path === "/sign-up/email" || ctx.path === "/change-password" || ctx.path === "/set-password"
      if (!isPasswordOp) return
      const pwd = ctx.body?.password ?? ctx.body?.newPassword
      const msg = getPasswordError(String(pwd || ""))
      if (msg) {
        throw new APIError("BAD_REQUEST", { message: msg })
      }
    }),
  },
})

export type AuthServer = typeof auth
