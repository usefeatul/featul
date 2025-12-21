import { Card } from '@oreilla/ui/components/card'

export function MeetingIllustration() {
  return (
    <Card aria-hidden className="p-4">
      <div className="relative hidden h-fit">
        <div className="absolute -left-1.5 bottom-1.5 rounded-md  border-t border-red-700 bg-red-500 px-1 py-px text-[10px] font-medium text-white shadow-md shadow-red-500/35">
          PDF
        </div>
        <div className="h-10 w-8 rounded-md  border bg-gradient-to-b from-zinc-100 to-zinc-200"></div>
      </div>
      <div className="mb-0.5 text-sm font-semibold">AI Strategy Meeting</div>
      <div className="mb-4 flex gap-2 text-sm">
        <span className="text-muted-foreground">2:30 - 3:45 PM</span>
      </div>
      <div className="text-muted-foreground text-sm font-medium">ML Pipeline Discussion</div>
    </Card>
  )
}