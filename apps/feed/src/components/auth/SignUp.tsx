"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@feedgot/auth/client"
import { Button } from "@feedgot/ui/components/button"
import { Input } from "@feedgot/ui/components/input"
import { Label } from "@feedgot/ui/components/label"
import { Badge } from "@feedgot/ui/components/badge"
import { GoogleIcon } from "@feedgot/ui/icons/google"
import GitHubIcon from "@feedgot/ui/icons/github"
import Link from "next/link"
import { toast } from "sonner"
import { strongPasswordPattern, getPasswordError } from "@feedgot/auth/password"
import { LoadingButton } from "@/components/loading-button"

export default function SignUp() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")
    setSubmitted(true)
    try {
      const msg = getPasswordError(password)
      if (msg) {
        toast.error(msg)
        setError(msg)
        return
      }
      const displayName = email.split("@")[0] || email
      await authClient.signUp.email({ name: displayName, email, password, callbackURL: "/auth/verify?email=" + encodeURIComponent(email) })
      toast.success("Account created. Check your email for the code")
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
    } catch (e: any) {
      setError(e?.message || "Failed to sign up")
      toast.error(e?.message || "Failed to sign up")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError("")
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })
    } catch (err) {
      setError("Failed with Google")
      toast.error("Failed with Google")
      setIsLoading(false)
    }
  }

  const handleGithubSignUp = async () => {
    setIsLoading(true)
    setError("")
    try {
      await authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" })
    } catch (err) {
      setError("Failed with GitHub")
      toast.error("Failed with GitHub")
      setIsLoading(false)
    }
  }

  return (
    <section className="flex min-h-screen bg-background">
      <form noValidate className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]" onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-left">
            <h1 className="mb-2 mt-4 text-xl font-semibold text-left">Sign up to Feedgot</h1>
            <p className="text-sm text-accent mb-2 text-left">Sign up with social or email</p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={handleGoogleSignUp} disabled={isLoading}>
                <GoogleIcon className="size-4" />
                <span>Google</span>
              </Button>
              <Button type="button" variant="outline" onClick={handleGithubSignUp} disabled={isLoading}>
                <GitHubIcon className="size-4" />
                <span>GitHub</span>
              </Button>
            </div>

            <div className="my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <hr className="border-dashed" />
              <span className="text-muted-foreground text-xs">Or use email</span>
              <hr className="border-dashed" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">Email</Label>
              <Input type="email" required id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="block text-sm">Password</Label>
              <Input
                type="password"
                required
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                pattern={strongPasswordPattern}
                title="8+ chars, uppercase, lowercase, number and symbol"
                aria-invalid={submitted && Boolean(getPasswordError(password))}
                aria-describedby={submitted && getPasswordError(password) ? "password-error" : undefined}
              />
              {submitted && getPasswordError(password) && (
                <p id="password-error" className="text-destructive text-xs">
                  {getPasswordError(password)}
                </p>
              )}
            </div>

            <LoadingButton className="w-full" type="submit" loading={isLoading}>Sign Up</LoadingButton>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Already have an account?
            <Button asChild variant="link" className="px-2">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  )
}