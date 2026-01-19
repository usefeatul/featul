import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { organization, lastLoginMethod, emailOTP, twoFactor } from "better-auth/plugins"
import { passkey } from "@better-auth/passkey"
import { db, user, session, account, verification, passkeyTable, twoFactorTable } from "@featul/db"
import { sendVerificationOtpEmail, sendWelcome } from "./email"
import { createAuthMiddleware, APIError } from "better-auth/api"
import { getPasswordError } from "./password"



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
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.AUTH_COOKIE_DOMAIN !== "localhost",
      domain: process.env.AUTH_COOKIE_DOMAIN,
    },
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },

  trustedOrigins: (process.env.AUTH_TRUSTED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean),

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

