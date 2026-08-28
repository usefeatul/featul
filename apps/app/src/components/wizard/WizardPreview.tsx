"use client"

import Image from "next/image"
import { WIZARD_PREVIEW_BACKGROUND, WIZARD_PREVIEW_IMAGE } from "./steps"

export default function WizardPreview() {
  return (
    <div className="relative h-44 min-h-0 overflow-hidden bg-card sm:h-52 lg:h-full">
      <Image
        src={WIZARD_PREVIEW_BACKGROUND}
        alt=""
        fill
        priority
        unoptimized
        sizes="50vw"
        className="object-cover"
      />
      <div className="absolute right-0 bottom-0 left-[12%] h-[90%] overflow-hidden rounded-tl-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.25)] ring-1 ring-black/10 dark:ring-white/10">
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
