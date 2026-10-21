"use client"

import Image from "next/image"
import { DitherGradient } from "@featul/ui/components/gradient"
import { WIZARD_PREVIEW_IMAGE } from "./steps"

export default function WizardPreview() {
  return (
    <div className="relative hidden min-h-0 overflow-hidden rounded-lg bg-primary lg:block lg:h-full">
      <DitherGradient to="primary" direction="right" cell={3} />
      <div className="absolute right-0 bottom-0 left-[12%] top-[8%] overflow-hidden rounded-tl-lg">
        <Image
          src={WIZARD_PREVIEW_IMAGE}
          alt="Featul dashboard"
          fill
          quality={100}
          sizes="max(100vh, 45vw)"
          className="object-cover object-left-top"
        />
      </div>
    </div>
  )
}
