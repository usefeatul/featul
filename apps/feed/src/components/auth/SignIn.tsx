"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@feedgot/auth/client"
import { Button } from "@feedgot/ui/components/button"
import { Input } from "@feedgot/ui/components/input"
import { Label } from "@feedgot/ui/components/label"
import { GoogleIcon } from "@feedgot/ui/icons/google"
import GitHubIcon from "@feedgot/ui/icons/github"
import { Badge } from "@feedgot/ui/components/badge"
import Link from "next/link"
import { toast } from "sonner"

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })
    } catch (err) {
      setError("Failed to sign in with Google")
      toast.error("Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      await authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" })
    } catch (err) {
      setError("Failed to sign in with GitHub")
      toast.error("Failed to sign in with GitHub")
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      await authClient.signIn.email({ email, password, callbackURL: "/dashboard" }, {
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            toast.info("Please verify your email")
            router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
            return
          }
          setError(ctx.error.message)
          toast.error(ctx.error.message)
        },
        onSuccess: () => {
          toast.success("Signed in")
          router.push("/dashboard")
        },
        onRequest: () => {},
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="flex min-h-screen bg-background">
      <form className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]" onSubmit={(e) => { e.preventDefault(); handleEmailSignIn() }}>
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <span className="text-xl font-semibold">Feedgot</span>
            </Link>
            <h1 className="mb-2 mt-4 text-xl font-semibold">Sign In</h1>
            <p className="text-sm text-accent mb-2">Welcome back! Sign in to continue</p>
            {error && (
              <div className="mt-3 flex justify-center">
                <Badge variant="destructive">{error}</Badge>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={handleGoogleSignIn} disabled={isLoading}>
                <GoogleIcon className="size-4" />
                <span>Google</span>
              </Button>
              <Button type="button" variant="outline" onClick={handleGithubSignIn} disabled={isLoading}>
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
              <Input type="email" required name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd" className="text-sm">Password</Label>
                <Button asChild variant="link" size="sm">
                  <Link href="#" className="text-sm">Forgot your Password ?</Link>
                </Button>
              </div>
              <Input type="password" required name="pwd" id="pwd" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>Sign In</Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Don't have an account ?
            <Button asChild variant="ghost" className="px-2">
              <Link href="/auth/sign-up">Create account</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  )
}