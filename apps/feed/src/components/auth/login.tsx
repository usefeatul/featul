"use client"

import { useState, useEffect } from "react"
import { authClient } from "@feedgot/auth/client"
import { Button } from "@feedgot/ui/components/button"
import { Input } from "@feedgot/ui/components/input"
import { Label } from "@feedgot/ui/components/label"
import { GoogleIcon } from "@feedgot/ui/icons/google"
import { Badge } from "@feedgot/ui/components/badge"
import GitHubIcon from "@feedgot/ui/icons/github"
import Link from "next/link"

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")



  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      })
    } catch (err) {
      setError("Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      })
    } catch (err) {
      setError("Failed to sign in with GitHub")
      setIsLoading(false)
    }
  }

  return (
    <section className="flex min-h-screen bg-background">
      <form
        action="#"
        className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
      >
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
              <Label htmlFor="email" className="block text-sm">Username</Label>
              <Input type="email" required name="email" id="email" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd" className="text-sm">Password</Label>
                <Button asChild variant="link" size="sm">
                  <Link href="#" className="link intent-info variant-ghost text-sm">Forgot your Password ?</Link>
                </Button>
              </div>
              <Input type="password" required name="pwd" id="pwd" className="input sz-md variant-mixed" />
            </div>

            <Button className="w-full" type="button" disabled={isLoading}>Sign In</Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Don't have an account ?
            <Button asChild variant="ghost" className="px-2">
              <Link href="#">Create account</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  )
}