import type { Metadata } from "next"
import ForgotPassword from "@/components/auth/ForgotPassword"

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your Feedgot password.",
  alternates: { canonical: "/auth/forgot-password" },
  robots: { index: false, follow: false },
}

export default function Page() {
  return <ForgotPassword />
}