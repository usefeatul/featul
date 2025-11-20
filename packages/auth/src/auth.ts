import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { organization, lastLoginMethod, emailOTP } from "better-auth/plugins"
import { db, user, session, account, verification } from "@feedgot/db"
import { sendEmail } from "./email"
import { renderVerifyEmail } from "./email/verifyemail"
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

  plugins: [
    organization(),
    lastLoginMethod(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        const subject = type === "email-verification" ? "Verify your Feedgot email" : type === "forget-password" ? "Reset your Feedgot password" : "Your Feedgot sign-in code"
        const { html, text } = renderVerifyEmail(otp, type)
        await sendEmail({ to: email, subject, html, text })
      },
    }),
  ],

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