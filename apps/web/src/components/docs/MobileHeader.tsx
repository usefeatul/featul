"use client"

import Link from "next/link"
import { Button } from "@featul/ui/components/button"
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo"

export function DocsMobileHeader() {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-14 flex items-center px-4 justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-medium text-base">
          <FeatulLogoIcon className="text-muted-foreground" size={20} />
          <span>Docs</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" className="text-md" asChild>
          <Link href="https://app.featul.com/auth/sign-in">Log in</Link>
        </Button>
        <Button asChild>
          <Link href="https://app.featul.com/auth/sign-up">Register</Link>
        </Button>
      </div>
    </div>
  )
}

