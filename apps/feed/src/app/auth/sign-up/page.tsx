import type { Metadata } from "next"
import SignUp from "@/components/auth/SignUp"

export const metadata: Metadata = {
  title: "Create Account",
  description: "Sign up for Feedgot.",
  alternates: { canonical: "/auth/sign-up" },
  robots: { index: false, follow: false },
}

export default function SignUpPage() {
  return <SignUp />
}