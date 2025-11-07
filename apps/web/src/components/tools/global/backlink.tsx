"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

type BackLinkProps = {
  text?: string
  className?: string
}

export default function BackLink({ text = "View our other tools", className = "mt-6 px-0" }: BackLinkProps) {
  const params = useParams() as { category?: string | string[] }
  const category = Array.isArray(params.category) ? params.category?.[0] : params.category
  const href = category ? `/tools/categories/${category}` : "/tools/categories"

  return (
    <div className={className}>
      <Link
        href={href}
        aria-label="Back to our tools categories"
        className="inline-flex items-center text-sm text-accent hover:text-foreground tracking-wide"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> {text}
      </Link>
    </div>
  )
}