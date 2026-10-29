import { trustedIpHeaders } from "./ip"
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  lastLoginMethod,
  emailOTP,
  twoFactor,
  multiSession,
} from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { stripe } from "@better-auth/stripe";
import {
  db,
  user,
  session,
  account,
  verification,
  passkeyTable,
  twoFactorTable,
  subscription as subscriptionTable,
} from "@featul/db";
import { sendVerificationOtpEmail, sendWelcome } from "./email";
import {
  createAuthEndpoint,
  APIError,
  sessionMiddleware,
} from "better-auth/api";
import { passwordAuthentication } from "./credentials";
import { getValidatedTrustedOrigins } from "./origins/trusted";
import { setSessionCookie } from "better-auth/cookies";
import { getAuthRateLimitStorage } from "./rate/storage";
import { isAuthRateLimitEnabled } from "./rate/config";
import { isWorkspaceBillingOwner } from "./billing";
import { getStripeClient } from "./stripe";
import { getAccountTrialCheckoutParams } from "./billing/trial";
import { readEnv } from "./selfhost";

function resolveCookieDomain() {
  const explicit = readEnv("AUTH_COOKIE_DOMAIN") || "";
  if (explicit) {
    if (explicit === "localhost" || explicit === "127.0.0.1") return "";
    return explicit;
  }
  const appUrl = readEnv("NEXT_PUBLIC_APP_URL") || "";
  if (!appUrl) return "";
  try {
    const hostname = new URL(appUrl).hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") return "";
    const parts = hostname.split(".").filter(Boolean);
    if (parts.length < 2) return "";
    return `.${parts.slice(-2).join(".")}`;
  } catch {
    return "";
  }
}

const cookieDomain = resolveCookieDomain();
const trustedOrigins = getValidatedTrustedOrigins("AUTH_TRUSTED_ORIGINS");
const authRateLimitStorage = getAuthRateLimitStorage();
const authRateLimitEnabled = isAuthRateLimitEnabled();

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
        if (
          !ctx.context.session?.session?.token ||
          !ctx.context.session?.user
        ) {
          throw new APIError("UNAUTHORIZED");
        }

        // Re-issue the current session cookie so multi-session hooks can seed
        // a missing per-device cookie for legacy sessions.
        await setSessionCookie(
          ctx,
          ctx.context.session as Parameters<typeof setSessionCookie>[1],
        );

        return ctx.json({ success: true });
      },
    ),
  },
};

const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || "").trim();
const stripeWebhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();
const stripeStarterMonthlyPriceId = (
  process.env.STRIPE_PRICE_ID_STARTER_MONTHLY || ""
).trim();
const stripeStarterYearlyPriceId = (
  process.env.STRIPE_PRICE_ID_STARTER_YEARLY || ""
).trim();
const stripeProfessionalMonthlyPriceId = (
  process.env.STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY || ""
).trim();
const stripeProfessionalYearlyPriceId = (
  process.env.STRIPE_PRICE_ID_PROFESSIONAL_YEARLY || ""
).trim();

const stripePlans = [
  stripeStarterMonthlyPriceId
    ? {
        name: "starter",
        priceId: stripeStarterMonthlyPriceId,
        annualDiscountPriceId: stripeStarterYearlyPriceId || undefined,
      }
    : null,
  stripeProfessionalMonthlyPriceId
    ? {
        name: "professional",
        priceId: stripeProfessionalMonthlyPriceId,
        annualDiscountPriceId: stripeProfessionalYearlyPriceId || undefined,
      }
    : null,
].filter(Boolean) as Array<{
  name: "starter" | "professional";
  priceId: string;
  annualDiscountPriceId?: string;
}>;

const stripePlugin = (() => {
  if (!stripeSecretKey || !stripeWebhookSecret || stripePlans.length === 0) return null;
  const stripeClient = getStripeClient();
  if (!stripeClient) return null;

  return stripe({
    stripeClient,
    stripeWebhookSecret,
    createCustomerOnSignUp: true,
    subscription: {
      enabled: true,
      plans: stripePlans,
      getCheckoutSessionParams: async ({ user, subscription }) => {
        return {
          // Configure trials here only: the plugin's per-workspace freeTrial
          // default would grant another trial on a second workspace.
          params: await getAccountTrialCheckoutParams(
            user.id, subscription.referenceId, subscription.id,
            14,
          ),
        };
      },
      authorizeReference: async ({ user, referenceId }) => {
        const workspaceId = String(referenceId || "").trim();
        return Boolean(workspaceId) && isWorkspaceBillingOwner(workspaceId, user.id);
      },
    },
    // Webhooks and checkout returns are handled by explicit app routes. They
    // share billing/sync.ts and propagate failures instead of plugin callbacks.
  });
})();

export const auth = betterAuth({
  // Same as Better Auth reading BETTER_AUTH_URL itself, plus the self-hosted default.
  baseURL: readEnv("BETTER_AUTH_URL"),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
      passkey: passkeyTable,
      twoFactor: twoFactorTable,
      subscription: subscriptionTable,
    },
  }),

  ...passwordAuthentication,

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
    // Tenant subdomains are same-site with the app, so Lax still reaches them; the widget signs
    // identities instead of relying on third-party cookies.
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: true,
    },
    ipAddress: {
      ipAddressHeaders: trustedIpHeaders(),
      ipv6Subnet: 64,
    },
  },

  trustedOrigins,

  rateLimit: {
    enabled: authRateLimitEnabled,
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
    lastLoginMethod(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        const normalizedType: Parameters<typeof sendVerificationOtpEmail>[2] =
          type === "forget-password"
            ? "forget-password"
            : type === "sign-in"
              ? "sign-in"
              : "email-verification";
        await sendVerificationOtpEmail(email, otp, normalizedType);
      },
    }),
    passkey({
      rpID: readEnv("PASSKEY_RP_ID") || "localhost",
      rpName: process.env.PASSKEY_RP_NAME || "Featul",
      origin:
        readEnv("PASSKEY_ORIGIN") ||
        readEnv("NEXT_PUBLIC_APP_URL") ||
        "http://localhost:3000",
    }),
    twoFactor({
      issuer: "Featul",
    }),
    multiSession(),
    multiSessionBootstrapPlugin,
    ...(stripePlugin ? [stripePlugin] : []),
  ],

  databaseHooks: {
    user: {
      create: {
        after: async (created) => {
          const to = String(created.email || "");
          if (!to) return;
          const name = String(created.name || "") || undefined;
          try {
            await sendWelcome(to, name);
          } catch (error) {
            console.error("Failed to send welcome email", error);
          }
        },
      },
    },
  },
});

export type AuthServer = typeof auth;
