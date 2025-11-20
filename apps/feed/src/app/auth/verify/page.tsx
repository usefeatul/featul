import type { Metadata } from "next"
import Verify from "@/components/auth/verify"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your Feedgot email.",
  alternates: { canonical: "/auth/verify" },
  robots: { index: false, follow: false },
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}> 
      <Verify />
    </Suspense>
  )
}