"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { client } from "@featul/api/client"
import { useSession } from "@featul/auth/client"
import { Button } from "@featul/ui/components/button"
import { Bell, CheckIcon, RssIcon } from "@/components/global/icons"
import { useSubdomainAuthModal } from "@/hooks/useSubdomainAuthModal"
import SubdomainAuthModal from "../SubdomainAuthModal"

/** RSS link and a sign-in-gated "Subscribe" toggle for changelog emails. */
export function ChangelogSubscribeBar({ slug, totalCount }: { slug: string; totalCount: number }) {
  const { data: session } = useSession()
  const signedIn = Boolean(session?.user)
  const queryClient = useQueryClient()
  const queryKey = ["changelog-subscription", slug, session?.user?.id]
  const [pending, setPending] = React.useState(false)
  const {
    isOpen: isAuthOpen,
    setOpen: setAuthOpen,
    mode: authMode,
    setMode: setAuthMode,
    redirectTo: authRedirect,
    openAuth,
  } = useSubdomainAuthModal()

  const { data } = useQuery({
    queryKey,
    enabled: signedIn,
    queryFn: async () => {
      const res = await client.changelog.subscriptionStatus.$get({ slug })
      if (!res.ok) return { subscribed: false }
      return (await res.json()) as { subscribed: boolean }
    },
    staleTime: 30_000,
  })
  const subscribed = signedIn && Boolean(data?.subscribed)

  const toggle = async () => {
    if (!signedIn) {
      toast.info("Sign in to subscribe to changelog updates")
      openAuth("sign-in")
      return
    }
    setPending(true)
    try {
      const res = subscribed
        ? await client.changelog.unsubscribe.$post({ slug })
        : await client.changelog.subscribe.$post({ slug })
      if (!res.ok) throw new Error("Request failed")
      const next = (await res.json()) as { subscribed: boolean }
      queryClient.setQueryData(queryKey, next)
      toast.success(
        next.subscribed ? "Subscribed. We'll email you when there's a new update." : "Unsubscribed from changelog emails",
      )
    } catch {
      toast.error("Couldn't update your subscription. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mb-8 flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium tabular-nums text-foreground">{totalCount}</span>{" "}
        {totalCount === 1 ? "update" : "updates"}
      </p>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" className="gap-1.5 px-3">
          <a href="/changelog/feed.xml" target="_blank" rel="noopener noreferrer">
            <RssIcon className="size-3.5" />
            RSS
          </a>
        </Button>
        <Button
          type="button"
          variant={subscribed ? "outline" : "default"}
          size="sm"
          className="gap-1.5 px-3"
          onClick={toggle}
          disabled={pending}
          aria-pressed={subscribed}
        >
          {subscribed ? <CheckIcon className="size-3.5" /> : <Bell className="size-3.5" />}
          {subscribed ? "Subscribed" : "Subscribe"}
        </Button>
      </div>
      <SubdomainAuthModal
        open={isAuthOpen}
        onOpenChange={setAuthOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        redirectTo={authRedirect}
      />
    </div>
  )
}
