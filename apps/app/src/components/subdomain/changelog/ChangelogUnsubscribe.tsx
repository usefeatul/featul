"use client"

import * as React from "react"
import Link from "next/link"
import { client } from "@featul/api/client"
import { Button } from "@featul/ui/components/button"

type State = "idle" | "pending" | "done" | "error"

/** One-click opt-out from changelog emails using the token in the email link. */
export function ChangelogUnsubscribe({ token }: { token: string }) {
  const [state, setState] = React.useState<State>("idle")

  const unsubscribe = async () => {
    setState("pending")
    try {
      const res = await client.changelog.unsubscribeByToken.$post({ token })
      setState(res.ok ? "done" : "error")
    } catch {
      setState("error")
    }
  }

  const invalid = token.length < 10

  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-16 text-center">
      {state === "done" ? (
        <>
          <h1 className="text-xl font-semibold text-foreground">You're unsubscribed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You won't get changelog emails any more. You can subscribe again from the changelog at any time.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-semibold text-foreground">Unsubscribe from changelog emails?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {invalid
              ? "This unsubscribe link is missing or incomplete. Open the link from your email again."
              : "You'll stop getting an email each time a new update is published."}
          </p>
          {!invalid ? (
            <Button className="mt-6 px-4" onClick={unsubscribe} disabled={state === "pending"}>
              {state === "pending" ? "Unsubscribing…" : "Unsubscribe"}
            </Button>
          ) : null}
          {state === "error" ? (
            <p className="mt-3 text-sm text-red-500">Something went wrong. Please try again.</p>
          ) : null}
        </>
      )}
      <Link href="/changelog" className="mt-6 text-sm text-muted-foreground hover:text-foreground">
        Back to changelog
      </Link>
    </section>
  )
}
