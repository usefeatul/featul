"use client"

import Image from "next/image"
import { WIZARD_PREVIEW_BACKGROUND, WIZARD_PREVIEW_IMAGE } from "./steps"

export default function WizardPreview() {
  return (
    <div className="relative hidden min-h-0 overflow-hidden rounded-xl lg:block lg:h-full">
      <Image
        src={WIZARD_PREVIEW_BACKGROUND}
        alt=""
        fill
        priority
        unoptimized
        sizes="50vw"
        className="object-cover"
      />
      <div className="absolute bottom-0 left-0 right-[12%] top-[8%] overflow-hidden rounded-tr-xl">
        <Image
          src={WIZARD_PREVIEW_IMAGE}
          alt="Featul dashboard"
          fill
          priority
          unoptimized
          sizes="50vw"
          className="object-cover object-left-top"
        />
      </div>
    </div>
  )
}
