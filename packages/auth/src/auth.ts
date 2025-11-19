import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { organization, lastLoginMethod, emailOTP } from "better-auth/plugins"
import { db, user, session, account, verification } from "@feedgot/db"
import { sendEmail } from "./email"
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
        const html = `
          <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
            <h2>${subject}</h2>
            <p>Use this code to continue:</p>
            <div style="font-size: 24px; font-weight: 700; letter-spacing: 4px;">${otp}</div>
            <p style="color:#6b7280">This code expires in 5 minutes. If you didn’t request it, you can ignore this email.</p>
          </div>
        `
        await sendEmail({ to: email, subject, html, text: `Your code is ${otp}` })
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