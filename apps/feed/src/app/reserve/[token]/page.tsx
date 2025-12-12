import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import ReserveConfirm from "@/components/reserve/ReserveConfirm"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  return createPageMetadata({
    title: "Confirm reservation",
    description: "Confirm your oreilla subdomain reservation.",
    path: `/reserve/${token}`,
    indexable: false,
  })
}

export default function ReserveConfirmPage() {
  return <ReserveConfirm />
}

