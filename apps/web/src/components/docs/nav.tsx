"use client"

import { DocsMobileHeader } from "./header"
import { DocsMobileFloatingNav } from "./floating"
export {
  getDocsCurrentPageLabel,
  getDocsCurrentSectionLabel,
} from "../../lib/nav"

export function DocsMobileNav() {
  return (
    <>
      <DocsMobileHeader />
      <DocsMobileFloatingNav />
    </>
  )
}

