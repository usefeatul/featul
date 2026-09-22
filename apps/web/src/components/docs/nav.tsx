"use client"

import { DocsMobileFloatingNav } from "./floating"

export {
  getDocsCurrentPageLabel,
  getDocsCurrentSectionLabel,
} from "../../lib/nav"

export function DocsMobileNav() {
  return <DocsMobileFloatingNav />
}
