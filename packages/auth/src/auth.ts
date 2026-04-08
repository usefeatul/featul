import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  organization,
  lastLoginMethod,
  emailOTP,
  twoFactor,
  multiSession,
} from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
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
  createAuthMiddleware,
  APIError,
  sessionMiddleware,
} from "better-auth/api";
import { getPasswordError } from "./password";
import { getValidatedTrustedOrigins } from "./trusted-origins";
import { setSessionCookie } from "better-auth/cookies";
import { getAuthRateLimitStorage } from "./rate-limit-storage";
import { isAuthRateLimitEnabled } from "./rate-limit-config";
import {
  sendFailedPaymentNotificationForInvoice,
  sendUpcomingPaymentNotificationForInvoice,
  sendWorkspaceUpgradeNotification,
} from "./billing-notifications";
import {
  isWorkspaceBillingOwner,
  syncWorkspacePlanFromSubscription,
} from "./billing";
import {
  getStripeClient,
  getStripePlanNameFromItems,
  type StripeBillingPlanName,
} from "./stripe";
import { captureServerAnalyticsEvent } from "./posthog";

function resolveCookieDomain() {
  const explicit = (process.env.AUTH_COOKIE_DOMAIN || "").trim();
  if (explicit) {
    if (explicit === "localhost" || explicit === "127.0.0.1") return "";
    return explicit;
  }
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").trim();
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
        freeTrial: {
          days: 7,
        },
      }
    : null,
  stripeProfessionalMonthlyPriceId
    ? {
        name: "professional",
        priceId: stripeProfessionalMonthlyPriceId,
        annualDiscountPriceId: stripeProfessionalYearlyPriceId || undefined,
        freeTrial: {
          days: 3,
        },
      }
    : null,
].filter(Boolean) as Array<{
  name: "starter" | "professional";
  priceId: string;
  annualDiscountPriceId?: string;
  freeTrial?: {
    days: number;
  };
}>;

function toPaidStripePlanName(plan: unknown): StripeBillingPlanName | null {
  if (plan === "starter" || plan === "professional") {
    return plan;
  }

  return null;
}

function getPreviousPlanFromSubscriptionUpdateEvent(event: Stripe.Event) {
  if (event.type !== "customer.subscription.updated") return null;

  const previousAttributes = (
    event.data as { previous_attributes?: { items?: unknown } }
  ).previous_attributes;
  const items = previousAttributes?.items;

  if (Array.isArray(items)) {
    return getStripePlanNameFromItems(items);
  }

  if (
    items &&
    typeof items === "object" &&
    Array.isArray((items as { data?: unknown[] }).data)
  ) {
    return getStripePlanNameFromItems((items as { data?: unknown[] }).data);
  }

  return null;
}

const stripePlugin = (() => {
  if (!stripeSecretKey || !stripeWebhookSecret || stripePlans.length === 0) {
    return null;
  }

  const stripeClient = getStripeClient();
  if (!stripeClient) {
    return null;
  }

  return stripe({
    stripeClient,
    stripeWebhookSecret,
    createCustomerOnSignUp: true,
    subscription: {
      enabled: true,
      plans: stripePlans,
      getCheckoutSessionParams: async ({ plan }) => {
        if (!plan.freeTrial) {
          return {};
        }

        return {
          params: {
            payment_method_collection: "if_required",
            subscription_data: {
              trial_settings: {
                end_behavior: {
                  missing_payment_method: "cancel",
                },
              },
            },
          },
        };
      },
      authorizeReference: async ({ user, referenceId }) => {
        const workspaceId = String(referenceId || "").trim();
        if (!workspaceId) return false;
        return isWorkspaceBillingOwner(workspaceId, user.id);
      },
      onSubscriptionComplete: async ({
        event,
        subscription,
      }: {
        event: Stripe.Event;
        subscription: {
          referenceId?: unknown;
          plan?: unknown;
          status?: unknown;
          billingInterval?: unknown;
          stripeSubscriptionId?: unknown;
        };
      }) => {
        await syncWorkspacePlanFromSubscription(subscription);

        const workspaceId = String(subscription.referenceId || "").trim();
        if (!workspaceId) return;

        const plan = toPaidStripePlanName(subscription.plan);
        if (plan) {
          await sendWorkspaceUpgradeNotification({
            workspaceId,
            plan,
            billingInterval:
              String(subscription.billingInterval || "").trim() || null,
            stripeSubscriptionId:
              String(subscription.stripeSubscriptionId || "").trim() || null,
            stripeEventId: event.id,
          });
        }
        await captureServerAnalyticsEvent(
          "subscription_upgraded",
          `workspace:${workspaceId}`,
          {
            workspace_id: workspaceId,
            plan: String(subscription.plan || ""),
            status: String(subscription.status || ""),
            source: "stripe_complete",
          },
        );
      },
      onSubscriptionCreated: async ({
        event,
        subscription,
      }: {
        event: Stripe.Event;
        subscription: {
          referenceId?: unknown;
          plan?: unknown;
          status?: unknown;
          billingInterval?: unknown;
          stripeSubscriptionId?: unknown;
        };
      }) => {
        await syncWorkspacePlanFromSubscription(subscription);

        const workspaceId = String(subscription.referenceId || "").trim();
        const plan = toPaidStripePlanName(subscription.plan);
        if (!workspaceId || !plan) return;

        await sendWorkspaceUpgradeNotification({
          workspaceId,
          plan,
          billingInterval:
            String(subscription.billingInterval || "").trim() || null,
          stripeSubscriptionId:
            String(subscription.stripeSubscriptionId || "").trim() || null,
          stripeEventId: event.id,
        });
      },
      onSubscriptionUpdate: async ({
        event,
        subscription,
      }: {
        event: Stripe.Event;
        subscription: {
          referenceId?: unknown;
          plan?: unknown;
          status?: unknown;
          billingInterval?: unknown;
          stripeSubscriptionId?: unknown;
        };
      }) => {
        await syncWorkspacePlanFromSubscription(subscription);

        const workspaceId = String(subscription.referenceId || "").trim();
        const currentPlan = toPaidStripePlanName(subscription.plan);
        const previousPlan = getPreviousPlanFromSubscriptionUpdateEvent(event);

        if (
          !workspaceId ||
          !currentPlan ||
          !previousPlan ||
          previousPlan === currentPlan
        ) {
          return;
        }

        await sendWorkspaceUpgradeNotification({
          workspaceId,
          plan: currentPlan,
          billingInterval:
            String(subscription.billingInterval || "").trim() || null,
          stripeSubscriptionId:
            String(subscription.stripeSubscriptionId || "").trim() || null,
          stripeEventId: event.id,
        });
      },
      onSubscriptionCancel: async ({
        subscription,
      }: {
        subscription: {
          referenceId?: unknown;
          plan?: unknown;
          status?: unknown;
        };
      }) => {
        await syncWorkspacePlanFromSubscription(subscription);
      },
      onSubscriptionDeleted: async ({
        subscription,
      }: {
        subscription: {
          referenceId?: unknown;
          plan?: unknown;
          status?: unknown;
        };
      }) => {
        await syncWorkspacePlanFromSubscription(subscription);
      },
      onTrialStart: async (subscription: {
        referenceId?: unknown;
        plan?: unknown;
        status?: unknown;
      }) => {
        await syncWorkspacePlanFromSubscription(subscription);
      },
      onTrialEnd: async ({
        subscription,
      }: {
        subscription: {
          referenceId?: unknown;
          plan?: unknown;
          status?: unknown;
        };
      }) => {
        await syncWorkspacePlanFromSubscription(subscription);
      },
      onTrialExpired: async (subscription: {
        referenceId?: unknown;
        plan?: unknown;
        status?: unknown;
      }) => {
        await syncWorkspacePlanFromSubscription(subscription);
      },
    },
    onEvent: async (event) => {
      switch (event.type) {
        case "invoice.payment_failed":
          await sendFailedPaymentNotificationForInvoice(
            event,
            event.data.object as Stripe.Invoice,
          );
          break;
        case "invoice.upcoming":
          await sendUpcomingPaymentNotificationForInvoice(
            event,
            event.data.object as Stripe.Invoice,
          );
          break;
      }
    },
  });
})();

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
      subscription: subscriptionTable,
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
    organization(),
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
      rpID: process.env.PASSKEY_RP_ID || "localhost",
      rpName: process.env.PASSKEY_RP_NAME || "Featul",
      origin:
        process.env.PASSKEY_ORIGIN ||
        process.env.NEXT_PUBLIC_APP_URL ||
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
          const userId = String(created.id || "").trim();
          try {
            await sendWelcome(to, name);
          } catch (error) {
            console.error("Failed to send welcome email", error);
          }
          if (userId) {
            await captureServerAnalyticsEvent("sign_up_completed", userId, {
              email: to,
              has_name: Boolean(name),
            });
          }
        },
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const isPasswordOp =
        ctx.path === "/sign-up/email" ||
        ctx.path === "/change-password" ||
        ctx.path === "/set-password";
      if (!isPasswordOp) return;
      const pwd = ctx.body?.password ?? ctx.body?.newPassword;
      const msg = getPasswordError(String(pwd || ""));
      if (msg) {
        throw new APIError("BAD_REQUEST", { message: msg });
      }
    }),
  },
});

export type AuthServer = typeof auth;
