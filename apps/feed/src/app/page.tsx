import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createPageMetadata } from "@/lib/seo"

export const revalidate = 30

export const metadata: Metadata = createPageMetadata({
  title: "oreilla",
  description: "Welcome to oreilla.",
  path: "/",
  indexable: false,
})

export default function Page() {
  redirect("/auth/sign-in")
}