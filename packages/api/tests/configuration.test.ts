import { expect, test } from "bun:test"
import { productionConfigurationErrors } from "@featul/auth/configuration"
import { sendEmail } from "@featul/auth/email/transport"

test("production preflight rejects missing secrets, local URLs, test billing and disabled limits without exposing values", () => {
  const errors = productionConfigurationErrors({ STRIPE_SECRET_KEY: "sk_test_never-print-this", NEXT_PUBLIC_APP_URL: "http://localhost:3000", AUTH_RATE_LIMIT_ENABLED: "false" })
  expect(errors).toContain("RESEND_API_KEY is required")
  expect(errors).toContain("CRON_SECRET is required")
  expect(errors).toContain("STRIPE_SECRET_KEY must be a live-mode key")
  expect(errors).toContain("NEXT_PUBLIC_APP_URL must use a public HTTPS URL")
  expect(errors).toContain("AUTH_RATE_LIMIT_ENABLED must not disable production rate limiting")
  expect(errors.join()).not.toContain("never-print-this")
})

test("production email cannot silently succeed without a provider key", async () => {
  const originalMode = process.env.NODE_ENV
  const originalKey = process.env.RESEND_API_KEY
  try {
    process.env.NODE_ENV = "production"
    delete process.env.RESEND_API_KEY
    await expect(sendEmail({ to: "test@example.test", subject: "Verification", text: "123456" })).rejects.toThrow("required for production email")
    await expect(sendEmail({ to: "test@example.test", subject: "Billing", idempotencyKey: "test", text: "test" })).rejects.toThrow("required for production email")
  } finally {
    if (originalMode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = originalMode
    if (originalKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = originalKey
  }
})
