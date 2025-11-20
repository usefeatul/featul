import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Feedgot",
  description: "Welcome to Feedgot.",
  alternates: { canonical: "/" },
  robots: { index: false, follow: false },
}

export default function Page() {
  redirect("/auth/sign-in")
}