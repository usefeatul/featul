"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@feedgot/auth/client"
import { Button } from "@feedgot/ui/components/button"
import { Input } from "@feedgot/ui/components/input"
import { Label } from "@feedgot/ui/components/label"
import { Badge } from "@feedgot/ui/components/badge"
import Link from "next/link"
import { toast } from "sonner"

export default function Verify() {
  const router = useRouter()
  const params = useSearchParams()
  const initialEmail = useMemo(() => params.get("email") || "", [params])
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail)
  }, [initialEmail])

  const resend = async () => {
    setIsLoading(true)
    setError("")
    setInfo("")
    try {
      await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" })
      setInfo("Verification code sent")
      toast.success("Verification code sent")
    } catch (e: any) {
      setError(e?.message || "Failed to send code")
      toast.error(e?.message || "Failed to send code")
    } finally {
      setIsLoading(false)
    }
  }

  const verify = async () => {
    setIsLoading(true)
    setError("")
    setInfo("")
    try {
      await authClient.emailOtp.verifyEmail({ email, otp: code })
      toast.success("Email verified")
      router.push("/dashboard")
    } catch (e: any) {
      setError(e?.message || "Invalid or expired code")
      toast.error(e?.message || "Invalid or expired code")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="flex min-h-screen bg-background">
      <form className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]" onSubmit={(e) => { e.preventDefault(); verify() }}>
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <span className="text-xl font-semibold">Feedgot</span>
            </Link>
            <h1 className="mb-2 mt-4 text-xl font-semibold">Verify Email</h1>
            <p className="text-sm text-accent mb-2">Enter the code sent to your email</p>
            {error && (
              <div className="mt-3 flex justify-center">
                <Badge variant="destructive">{error}</Badge>
              </div>
            )}
            {info && (
              <div className="mt-3 flex justify-center">
                <Badge>{info}</Badge>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">Email</Label>
              <Input type="email" required id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="block text-sm">Verification Code</Label>
              <Input type="text" required id="code" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>Verify</Button>
            <Button className="w-full" type="button" variant="outline" onClick={resend} disabled={isLoading}>Resend Code</Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Already verified?
            <Button asChild variant="ghost" className="px-2">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  )
}