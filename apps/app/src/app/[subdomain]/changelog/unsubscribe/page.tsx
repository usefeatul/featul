import type { Metadata } from "next"
import { resolveSearchParams } from "@/utils/search/params"
import { ChangelogUnsubscribe } from "@/components/subdomain/changelog/ChangelogUnsubscribe"

export const metadata: Metadata = {
  title: "Unsubscribe from changelog emails",
  robots: { index: false, follow: false },
}

/** Email footer target. Unsubscribing needs a click so link scanners can't trigger it. */
export default async function ChangelogUnsubscribePage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>
}) {
  const sp = (await resolveSearchParams(searchParams)) ?? {}
  return <ChangelogUnsubscribe token={String(sp.token || "")} />
}
