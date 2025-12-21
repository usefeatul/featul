"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import { client } from "@oreilla/api/client"
import { Button } from "@oreilla/ui/components/button"
import { toast } from "sonner"
import { authClient } from "@oreilla/auth/client"
import { Link2, Mail } from "lucide-react"

export default function ReserveConfirm() {
  const router = useRouter()
  const routeParams = useParams() as any
  const tokenParam = typeof routeParams?.token === "string" ? routeParams.token : undefined

  const [loading, setLoading] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [token, setToken] = React.useState("")
  const [slug, setSlug] = React.useState<string | null>(null)
  const [email, setEmail] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const t = ((tokenParam || "") as string).trim()
    if (!t) return
    setToken(t)
    let mounted = true
    setLoading(true)
    const lookupPromise = client.reservation.lookupByToken.$get({ token: t })
    ;(async () => {
      const res = await lookupPromise
      if (!res.ok) {
        if ((res as any)?.status === 410) setError("This reservation has expired.")
        else setError("Invalid reservation link.")
      } else {
        const data = await res.json()
        const r = data?.reservation as { slug?: string; email?: string } | null
        if (!r) setError("Reservation not found or expired.")
        else {
          if (mounted) {
            setSlug(r.slug || null)
            setEmail(r.email || null)
          }
        }
      }
      if (mounted) setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [tokenParam])

  const handleConfirm = async () => {
    if (!token || busy) return
    setBusy(true)
    try {
      const res = await client.reservation.confirm.$post({ token })
      if (!res.ok) throw new Error("Confirm failed")
      toast.success("Reservation confirmed")
      try {
        const s = await authClient.getSession()
        if (s?.data?.user?.email) router.replace(`/start?slug=${slug}`)
      } catch {}
    } catch (e) {
      toast.error("Confirmation failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 space-y-1">
          <h1 className="text-3xl sm:text-4xl font-semibold">Confirm reservation</h1>
          <p className="text-sm sm:text-base text-accent">Secure your subdomain before signing up.</p>
        </div>
        {error ? (
          <div className="mb-3 text-sm text-destructive">{error}</div>
        ) : null}
        {loading ? (
          <div className="h-5 w-64 bg-muted rounded animate-pulse" />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="size-4 text-accent" />
              <div className="rounded-md  bg-muted px-2 py-1 text-sm font-mono">{slug}.oreilla.com</div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-accent" />
              <div className="rounded-md  bg-muted px-2 py-1 text-sm font-mono">{email}</div>
            </div>
          </div>
        )}
        <div className="mt-6">
          <Button type="button" variant="quiet" size="lg" className="w-full bg-primary/90 hover:bg-primary text-white" disabled={busy} onClick={handleConfirm}>
            Confirm reservation
          </Button>
        </div>
      </div>
    </section>
  )
}
