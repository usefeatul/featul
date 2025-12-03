"use client"

import React from "react"
import { client } from "@feedgot/api/client"
import { Input } from "@feedgot/ui/components/input"
import { Button } from "@feedgot/ui/components/button"
import { toast } from "sonner"
import { isSlugValid } from "@/lib/validators"
import { Link2, Mail } from "lucide-react"

export default function ReserveForm() {
  const [email, setEmail] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [available, setAvailable] = React.useState<null | boolean>(null)
  const [checking, setChecking] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [cooldownUntil, setCooldownUntil] = React.useState<number | null>(null)
  const [now, setNow] = React.useState<number>(Date.now())
  const [limitReached, setLimitReached] = React.useState(false)

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const check = async (s: string) => {
    const v = (s || "").trim().toLowerCase()
    if (!isSlugValid(v)) {
      setAvailable(null)
      return
    }
    setChecking(true)
    try {
      const res = await client.reservation.checkSlug.$post({ slug: v })
      const data = await res.json()
      setAvailable(Boolean(data?.available))
    } catch {
      setAvailable(null)
    } finally {
      setChecking(false)
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setSlug(v)
    check(v)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (cooldownUntil && now < cooldownUntil) return
    setBusy(true)
    try {
      const s = slug.trim().toLowerCase()
      const em = email.trim().toLowerCase()
      if (!isSlugValid(s)) throw new Error("Invalid slug")
      if (!em || !em.includes("@")) throw new Error("Invalid email")
      const res = await client.reservation.reserve.$post({ slug: s, email: em })
      if (!res.ok) {
        if ((res as any)?.status === 429) {
          setCooldownUntil(Date.now() + 60_000)
          throw new Error("Too many requests. Please wait a minute.")
        }
        if ((res as any)?.status === 403) {
          setLimitReached(true)
          throw new Error("You have reached the maximum of 3 reservations.")
        }
        throw new Error("Reservation failed")
      }
      toast.success("Reservation created. Check your email to confirm.")
      setCooldownUntil(Date.now() + 60_000)
      setEmail("")
      setSlug("")
      setAvailable(null)
      setChecking(false)
      setLimitReached(false)
    } catch (e) {
      toast.error((e as any)?.message || "Reservation failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 space-y-1">
          <h1 className="text-3xl sm:text-4xl font-semibold">Reserve your subdomain</h1>
          <p className="text-sm sm:text-base text-accent">Pick a name like <span className="font-mono">acme</span> to get <span className="font-mono">acme.feedgot.com</span>.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm text-accent">Subdomain</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-accent" />
                <Input value={slug} onChange={handleSlugChange} placeholder="yourname" className="pl-9 pr-28" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-muted-foreground select-none">.feedgot.com</span>
              </div>
              <div className="flex items-center gap-2">
                {checking ? (
                  <div className="mt-1 h-4 w-24 bg-muted rounded animate-pulse" />
                ) : available === true ? (
                  <div className="mt-1 text-xs text-emerald-600">Available</div>
                ) : available === false ? (
                  <div className="mt-1 text-xs text-red-600">Unavailable</div>
                ) : (
                  <div className="mt-1 text-xs text-accent">Only lowercase letters, 5–32 characters</div>
                )}
                <div className="ml-auto text-[11px] text-accent">{slug ? `${slug}.feedgot.com` : `yourname.feedgot.com`}</div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-accent">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-accent" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" />
              </div>
            </div>
            <Button type="submit" variant="quiet" size="lg" className="w-full bg-primary/90 hover:bg-primary text-white" disabled={busy || checking || !available || limitReached || (cooldownUntil ? now < cooldownUntil : false)}>
              {limitReached ? "Reservation limit reached" : cooldownUntil && now < cooldownUntil ? `Please wait ${Math.ceil((cooldownUntil - now) / 1000)}s` : "Reserve"}
            </Button>
            {limitReached ? <div className="-mt-3 text-xs text-red-600">You can reserve up to 3 subdomains per email.</div> : null}
        </form>
      </div>
    </section>
  )
}
