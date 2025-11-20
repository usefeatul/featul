import type { Metadata } from "next"
import SignIn from "@/components/auth/SignIn"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Access your Feedgot account.",
  alternates: { canonical: "/auth/sign-in" },
  robots: { index: false, follow: false },
}

export default function SignInPage() {
  return <SignIn />
}