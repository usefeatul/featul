"use client"

export default function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`inline-block h-1.5 rounded-md ${i === step ? 'w-6 bg-foreground/80' : 'w-3 bg-foreground/20'}`} />
      ))}
    </div>
  )
}