import type { BetterAuthOptions } from "better-auth";
import { APIError, createAuthMiddleware, isAPIError } from "better-auth/api";
import { deleteSessionCookie } from "better-auth/cookies";
import { getPasswordError } from "./password";

export const passwordAuthentication = {
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
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
      if (ctx.path === "/change-password") {
        // Revoke every session in the after hook; do not create a replacement
        // session as Better Auth's revokeOtherSessions option would do.
        return {
          context: { body: { ...ctx.body, revokeOtherSessions: false } },
        };
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const isPasswordChange =
        ctx.path === "/change-password" || ctx.path === "/set-password";
      const isPasswordReset =
        ctx.path === "/reset-password" ||
        ctx.path === "/email-otp/reset-password";
      if (!isPasswordChange && !isPasswordReset) return;
      if (!ctx.context.returned || isAPIError(ctx.context.returned)) return;

      if (isPasswordChange) {
        const userId = ctx.context.session?.user.id;
        if (!userId) throw new APIError("INTERNAL_SERVER_ERROR");
        // The current session must also expire after a credential change.
        await ctx.context.internalAdapter.deleteUserSessions(userId);
      }
      // Reset endpoints revoke sessions through revokeSessionsOnPasswordReset.
      deleteSessionCookie(ctx);
    }),
  },
} satisfies Pick<BetterAuthOptions, "emailAndPassword" | "hooks">;
