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
import { isStrongPassword, strongPasswordPattern } from "@feedgot/auth/password"

export default function SignUp() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")
    try {
      if (!isStrongPassword(password)) {
        toast.error("Password must be 8+ chars, include uppercase, lowercase, number, and symbol")
        setError("Weak password")
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
      <form className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]" onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <span className="text-xl font-semibold">Feedgot</span>
            </Link>
            <h1 className="mb-2 mt-4 text-xl font-semibold">Create Account</h1>
            <p className="text-sm text-accent mb-2">Sign up with social or email</p>
            {error && (
              <div className="mt-3 flex justify-center">
                <Badge variant="destructive">{error}</Badge>
              </div>
            )}
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
              <Input type="password" required id="password" value={password} onChange={(e) => setPassword(e.target.value)} pattern={strongPasswordPattern} title="8+ chars, uppercase, lowercase, number and symbol" />
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>Sign Up</Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Already have an account?
            <Button asChild variant="ghost" className="px-2">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  )
}