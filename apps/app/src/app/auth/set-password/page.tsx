import type { Metadata } from "next"
import SetPassword from "@/components/auth/SetPassword"
import { createPageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

export const metadata: Metadata = createPageMetadata({
    title: "Set Password",
    description: "Add a password to your featul account.",
    path: "/auth/set-password",
    indexable: false,
})

export default function Page() {
    return <SetPassword />
}
