"use client"

import Image from "next/image"
import { DitherGradient } from "@featul/ui/components/gradient"
import type { Rgb } from "@featul/ui/lib/palette"
import { WIZARD_PREVIEW_IMAGE } from "./steps"

const highlight: Rgb = [255, 255, 255]
const shade: Rgb = [0, 0, 0]

export default function WizardPreview() {
  return (
    <div className="relative hidden min-h-0 overflow-hidden rounded-xl bg-primary lg:block lg:h-full">
      <DitherGradient
        from={highlight}
        direction="right"
        cell={3}
        opacity={0.35}
      />
      <DitherGradient
        from={shade}
        direction="up"
        cell={3}
        opacity={0.16}
      />
      <div className="absolute right-0 bottom-0 left-[7%] top-[6%] overflow-hidden rounded-tl-xl">
        <Image
          src={WIZARD_PREVIEW_IMAGE}
          alt="Featul dashboard"
          fill
          sizes="50vw"
          className="object-cover object-left-top"
        />
      </div>
    </div>
  )
}
