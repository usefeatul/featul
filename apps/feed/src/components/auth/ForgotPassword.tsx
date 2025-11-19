"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@feedgot/auth/client"
import { Button } from "@feedgot/ui/components/button"
import { Input } from "@feedgot/ui/components/input"
import { Label } from "@feedgot/ui/components/label"
import Link from "next/link"
import { toast } from "sonner"
import { LoadingButton } from "@/components/loading-button"
import { strongPasswordPattern, getPasswordError } from "@feedgot/auth/password"

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hasSent, setHasSent] = useState(false)

  const sendResetCode = async () => {
    setIsSending(true)
    setError("")
    setInfo("")
    setSubmitted(false)
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: "forget-password" })
      if (error) {
        setError(error.message || "Failed to send reset code")
        toast.error(error.message || "Failed to send reset code")
        return
      }
      setHasSent(true)
      setInfo("Reset code sent to your email")
      toast.success("Reset code sent")
    } catch (e: any) {
      setError(e?.message || "Failed to send reset code")
      toast.error(e?.message || "Failed to send reset code")
    } finally {
      setIsSending(false)
    }
  }

  const resetPassword = async () => {
    setIsResetting(true)
    setError("")
    setInfo("")
    setSubmitted(true)
    try {
      const pwdErr = getPasswordError(password)
      if (pwdErr) {
        setError(pwdErr)
        toast.error(pwdErr)
        return
      }
      const { error } = await authClient.emailOtp.resetPassword({ email: email.trim(), otp: code.trim(), password })
      if (error) {
        setError(error.message || "Reset failed")
        toast.error(error.message || "Reset failed")
        return
      }
      toast.success("Password reset", { duration: 2000 })
      await new Promise((r) => setTimeout(r, 600))
      await authClient.signIn.email(
        { email: email.trim(), password, callbackURL: "/dashboard" },
        {
          onError: (ctx) => {
            if (ctx.error.status === 403) {
              toast.info("Please verify your email")
              router.push(`/auth/verify?email=${encodeURIComponent(email.trim())}`)
              return
            }
            setError(ctx.error.message)
            toast.error(ctx.error.message)
          },
          onSuccess: () => {
            setTimeout(() => toast.success("Signed in"), 400)
            router.push("/dashboard")
          },
        }
      )
    } catch (e: any) {
      setError(e?.message || "Reset failed")
      toast.error(e?.message || "Reset failed")
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <section className="flex min-h-screen bg-background">
      <form noValidate className="bg-background m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]" onSubmit={(e) => { e.preventDefault(); hasSent ? resetPassword() : sendResetCode() }}>
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-left">
            <h1 className="mb-2 mt-4 text-xl font-semibold text-left">Forgot your password</h1>
            <p className="text-sm text-accent mb-2 text-left">Enter your email to receive a reset code</p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">Email</Label>
              <Input type="email" required id="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {hasSent && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="code" className="block text-sm">Verification Code</Label>
                  <Input
                    type="text"
                    required
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    inputMode="numeric"
                    pattern="^[0-9]{6}$"
                    title="Enter the 6-digit code"
                    autoComplete="one-time-code"
                    aria-invalid={submitted && Boolean(error)}
                    aria-describedby={submitted && error ? "code-error" : undefined}
                  />
                  {submitted && error && (
                    <p id="code-error" className="text-destructive text-xs">{error}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="block text-sm">New Password</Label>
                  <Input
                    type="password"
                    required
                    id="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="placeholder:text-accent/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    pattern={strongPasswordPattern}
                    title="8+ chars, uppercase, lowercase, number and symbol"
                    aria-invalid={submitted && Boolean(getPasswordError(password))}
                    aria-describedby={submitted && getPasswordError(password) ? "reset-password-error" : undefined}
                  />
                  {submitted && getPasswordError(password) && (
                    <p id="reset-password-error" className="text-destructive text-xs">{getPasswordError(password)}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <LoadingButton className="w-full" type="button" variant="outline" onClick={sendResetCode} loading={isSending}>Resend Code</LoadingButton>
                  <LoadingButton className="w-full" type="submit" loading={isResetting}>Reset Password</LoadingButton>
                </div>
              </>
            )}

            {!hasSent && (
              <LoadingButton className="w-full" type="submit" loading={isSending}>Send Reset Code</LoadingButton>
            )}
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Remembered your password?
            <Button asChild variant="link" className="px-2">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  )
}