"use client"

export default function RightInfo() {
  const blocks = [
    { label: "Collect", color: "bg-red-400" },
    { label: "Discuss", color: "bg-purple-500" },
    { label: "Plan", color: "bg-emerald-500" },
    { label: "Publish", color: "bg-blue-500" },
  ]
  return (
    <div className="flex flex-col items-start gap-6 py-10">
      {blocks.map((b) => (
        <div key={b.label} className={`${b.color} text-white rounded-xl px-8 py-6 text-2xl font-semibold shadow-sm`}>{b.label}</div>
      ))}
    </div>
  )
}