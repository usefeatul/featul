"use client"

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@feedgot/ui/components/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@feedgot/ui/components/tabs"
import { Input } from "@feedgot/ui/components/input"
import { Label } from "@feedgot/ui/components/label"
import { Button } from "@feedgot/ui/components/button"
import { LoadingButton } from "@/components/global/loading-button"
import { GoogleIcon } from "@feedgot/ui/icons/google"
import GitHubIcon from "@feedgot/ui/icons/github"
import { toast } from "sonner"
import { authClient } from "@feedgot/auth/client"
import { strongPasswordPattern, getPasswordError } from "@feedgot/auth/password"

type Mode = "sign-in" | "sign-up"

export function DomainAuthModal({ open, onOpenChange, mode: initialMode = "sign-in" }: { open: boolean; onOpenChange: (v: boolean) => void; mode?: Mode }) {
  const router = useRouter()
  const search = useSearchParams()
  const [mode, setMode] = React.useState<Mode>(initialMode)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    setMode(initialMode)
    setEmail("")
    setPassword("")
    setError("")
    setSubmitted(false)
    setLoading(false)
  }, [initialMode, open])

  const currentUrl = typeof window !== "undefined" ? window.location.href : "/"

  const broadcast = React.useMemo(() => (typeof window !== "undefined" ? new BroadcastChannel("auth") : null), [])
  React.useEffect(() => () => { broadcast?.close() }, [broadcast])

  const social = async (provider: "google" | "github") => {
    if (loading) return
    setLoading(true)
    setError("")
    try {
      await authClient.signIn.social({ provider, callbackURL: currentUrl })
    } catch (e) {
      toast.error(`Failed with ${provider}`)
      setError(`Failed with ${provider}`)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async () => {
    if (loading) return
    setLoading(true)
    setError("")
    try {
      await authClient.signIn.email(
        { email: email.trim(), password },
        {
          onError: (ctx) => {
            if (ctx.error.status === 403) {
              toast.info("Please verify your email to complete sign in")
              return
            }
            setError(ctx.error.message)
            toast.error(ctx.error.message)
          },
          onSuccess: () => {
            toast.success("Signed in")
            broadcast?.postMessage({ type: "signed-in" })
            onOpenChange(false)
          },
        },
      )
    } finally {
      setLoading(false)
    }
  }

  const signUp = async () => {
    if (loading) return
    setLoading(true)
    setError("")
    setSubmitted(true)
    try {
      const msg = getPasswordError(password)
      if (msg) {
        toast.error(msg)
        setError(msg)
        return
      }
      const displayName = email.trim().split("@")[0] || email.trim()
      await authClient.signUp.email({
        name: displayName,
        email: email.trim(),
        password,
      })
      toast.success("Account created. Check your email for the verification code")
      broadcast?.postMessage({ type: "signed-up" })
      onOpenChange(false)
    } catch (e: any) {
      setError(e?.message || "Failed to sign up")
      toast.error(e?.message || "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "sign-in" ? "Sign in" : "Sign up"}</DialogTitle>
        </DialogHeader>
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="w-full">
            <TabsTrigger value="sign-in" className="flex-1">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up" className="flex-1">Sign Up</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => social("google")} disabled={loading} className="gap-2">
                <GoogleIcon className="size-4" />
                <span>Google</span>
              </Button>
              <Button type="button" variant="outline" onClick={() => social("github")} disabled={loading} className="gap-2">
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
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input id="email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <TabsContent value="sign-in" className="space-y-2">
              <Label htmlFor="pwd" className="text-sm">Password</Label>
              <Input id="pwd" type="password" required autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              <LoadingButton className="w-full mt-2" loading={loading} onClick={signIn}>Sign In</LoadingButton>
            </TabsContent>

            <TabsContent value="sign-up" className="space-y-2">
              <Label htmlFor="newpwd" className="text-sm">Password</Label>
              <Input
                id="newpwd"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                pattern={strongPasswordPattern}
                title="8+ chars, uppercase, lowercase, number and symbol"
                aria-invalid={submitted && Boolean(getPasswordError(password))}
                aria-describedby={submitted && getPasswordError(password) ? "password-error" : undefined}
              />
              {submitted && getPasswordError(password) && (
                <p id="password-error" className="text-destructive text-xs">{getPasswordError(password)}</p>
              )}
              <LoadingButton className="w-full mt-2" loading={loading} onClick={signUp}>Sign Up</LoadingButton>
            </TabsContent>

            {error && <p className="text-destructive text-xs mt-1">{error}</p>}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
