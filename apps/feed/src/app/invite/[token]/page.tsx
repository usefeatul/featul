import type { Metadata } from "next"
import Invite from "@/components/invite/Invite"
import { createPageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"


type Props = { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  return createPageMetadata({
    title: "Invite",
    description: "Join your Feedgot workspace.",
    path: `/invite/${token}`,
    indexable: false,
  })
}

export default function InviteAcceptPage() {
  return <Invite />
}
