import { Card } from '@feedgot/ui/components/card'
import { Button } from '@feedgot/ui/components/button'
import { Sparkles, Plus, Globe, ArrowUp } from 'lucide-react'

export function AIAssistantIllustration() {
  return (
    <Card aria-hidden className="p-4 transition-transform duration-200 group-hover:translate-y-0">
      <div className="max-w-3/4 ml-auto w-fit">
        <p className="border-foreground/5 bg-foreground/5 mb-2 rounded-l-2xl rounded-t-2xl rounded-br border p-4 text-sm">
          Mollitia rerum est quisquam nobis ut cumque, dolore earum a voluptate esse. Illo, rerum esse?
        </p>
        <span className="text-muted-foreground block text-right text-xs">Now</span>
      </div>
      <div className="w-fit">
        <Sparkles className="size-3.5 fill-purple-300 stroke-purple-300" />
        <p className="mt-2 line-clamp-2 text-sm">
          How can I optimize my neural network to reduce inference time while maintaining accuracy?
        </p>
      </div>
      <div className="bg-foreground/5 -mx-3 -mb-3 mt-3 space-y-3 rounded-md p-3">
        <div className="text-muted-foreground text-sm">Ask AI Assistant</div>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="size-8 rounded-md bg-transparent shadow-none" aria-label="Add">
              <Plus />
            </Button>
            <Button variant="outline" size="icon" className="size-8 rounded-md bg-transparent shadow-none" aria-label="Global">
              <Globe />
            </Button>
          </div>

          <Button size="icon" className="size-8 rounded-md bg-black" aria-label="Send">
            <ArrowUp strokeWidth={3} />
          </Button>
        </div>
      </div>
    </Card>
  )
}