import Image from "next/image"
import { cn } from "@oreilla/ui/lib/utils"

type LeftSideImageProps = {
  src?: string
  alt?: string
  height?: number
  className?: string
  priority?: boolean
}

export default function LeftSideImage({
  src = "/workspaceimg.png",
  alt = "Workspace preview",
  height = 560,
  className,
  priority = true,
}: LeftSideImageProps) {
  return (
    <div className={cn("hidden md:block", className)}>
      <div className="relative w-full" style={{ height }}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="(min-width: 768px) 640px, 100vw"
          priority={priority}
        />
      </div>
    </div>
  )
}
