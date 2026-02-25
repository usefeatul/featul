import { authClient } from "@featul/auth/client";

export type OtpType = "email-verification" | "forget-password" | "sign-in";

type CheckOtpParams = {
  email: string;
  otp: string;
  type: OtpType;
};

type CheckOtpResult = {
  error?: { message?: string } | null;
};

/**
 * Verify an OTP code with a specific type.
 * This is a type-safe wrapper around better-auth's checkVerificationOtp.
 */
export async function checkVerificationOtp(
  params: CheckOtpParams
): Promise<CheckOtpResult> {
  const checkOtp = authClient.emailOtp.checkVerificationOtp as (
    opts: CheckOtpParams
  ) => Promise<CheckOtpResult>;

  return checkOtp(params);
}

/**
 * Send a verification OTP to an email address.
 */
export async function sendVerificationOtp(email: string, type: OtpType) {
  return authClient.emailOtp.sendVerificationOtp({
    email: email.trim(),
    type,
  });
}

/**
 * Verify an email with an OTP (for email-verification type).
 */
export async function verifyEmail(email: string, otp: string) {
  return authClient.emailOtp.verifyEmail({
    email: email.trim(),
    otp: otp.trim(),
  });
}

/**
 * Reset password with an OTP (for forget-password type).
 */
export async function resetPassword(
  email: string,
  otp: string,
  password: string
) {
  return authClient.emailOtp.resetPassword({
    email: email.trim(),
    otp: otp.trim(),
    password,
  });
}
