"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@feedgot/ui/components/button"

export default function EmptyDomainPosts({ subdomain, slug }: { subdomain: string; slug: string }) {
  const redirect = `/${subdomain}/${slug}`
  return (
    <div className="p-6 text-center">
      <div className="text-sm font-medium">No posts yet</div>
      <p className="mt-2 text-xs text-accent">Be the first to submit an idea.</p>
      <div className="mt-4">
        <Button asChild className="h-9 px-4 bg-primary hover:bg-primary/90 ring-ring/60 hover:ring-ring">
          <Link href={`/auth/sign-in?redirect=${encodeURIComponent(redirect)}`}>Submit a Post</Link>
        </Button>
      </div>
    </div>
  )
}

