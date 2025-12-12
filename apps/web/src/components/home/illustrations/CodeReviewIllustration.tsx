import { Card } from '@oreilla/ui/components/card'
import { Signature, Play } from 'lucide-react'
import Image from 'next/image'

const MESCHAC_AVATAR = 'https://avatars.githubusercontent.com/u/47919550?v=4'

export function CodeReviewIllustration() {
  return (
    <div aria-hidden className="relative">
      <Card className="aspect-video w-4/5 translate-y-2 p-3">
        <div className="mb-3 grid grid-cols-[auto_1fr] gap-2">
          <div className="bg-background size-6 rounded-md border p-0.5 shadow shadow-zinc-950/5">
            <Image
              className="aspect-square rounded-md object-cover"
              src={MESCHAC_AVATAR}
              alt="M Irung"
              height={460}
              width={460}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground line-clamp-1 text-sm font-medium">Méschac Irung</span>
            <span className="text-muted-foreground/75 text-xs">2m</span>
          </div>
        </div>

        <div className="ml-8 space-y-2">
          <div className="bg-foreground/10 h-2 rounded-md"></div>
          <div className="bg-foreground/10 h-2 w-3/5 rounded-md"></div>
          <div className="bg-foreground/10 h-2 w-1/2 rounded-md"></div>
        </div>

        <Signature className="ml-8 mt-3 size-5" />
      </Card>
      <Card className="aspect-3/5 absolute right-0 top-4 flex w-2/5 translate-y-4 p-2 transition-transform duration-200 ease-in-out group-hover:rotate-3">
        <div className="bg-foreground/5 m-auto flex size-10 rounded-md">
          <Play className="fill-foreground/50 stroke-foreground/50 m-auto size-4" />
        </div>
      </Card>
    </div>
  )
}