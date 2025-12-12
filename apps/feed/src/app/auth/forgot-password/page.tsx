import type { Metadata } from "next"
import ForgotPassword from "@/components/auth/ForgotPassword"
import { createPageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"


export const metadata: Metadata = createPageMetadata({
  title: "Forgot Password",
  description: "Reset your oreilla password.",
  path: "/auth/forgot-password",
  indexable: false,
})

export default function Page() {
  return <ForgotPassword />
}