"use client"

import { DocsMobileHeader } from "./MobileHeader"
import { DocsMobileFloatingNav } from "./MobileFloatingNav"
export {
  getDocsCurrentPageLabel,
  getDocsCurrentSectionLabel,
} from "../../lib/mobile-nav-utils"

export function DocsMobileNav() {
  return (
    <>
      <DocsMobileHeader />
      <DocsMobileFloatingNav />
    </>
  )
}

