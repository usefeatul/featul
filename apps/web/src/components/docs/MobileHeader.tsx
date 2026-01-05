"use client"

import { Button } from "@featul/ui/components/button"
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo"

export function DocsMobileHeader() {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-14 flex items-center px-4 justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-medium text-base">
          <FeatulLogoIcon className="text-muted-foreground" size={20} />
          <span>Docs</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" className="text-md">
          Log in
        </Button>
        <Button>Register</Button>
      </div>
    </div>
  )
}

