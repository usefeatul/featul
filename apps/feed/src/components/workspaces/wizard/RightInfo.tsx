"use client"

export default function RightInfo() {
  const blocks = [
    { label: "Gather", color: "bg-red-400" },
    { label: "Connect", color: "bg-purple-500" },
    { label: "Build", color: "bg-emerald-500" },
    { label: "Launch", color: "bg-blue-500" },
  ]
  return (
    <div className="flex sm:block w-full items-center gap-5 sm:relative sm:h-[400px] md:h-[460px]">
      {blocks.map((b, i) => {
        const positions = [
          "sm:absolute sm:left-10 sm:top-6 md:left-16 md:top-8 sm:rotate-[-3deg] z-40",
          "sm:absolute sm:left-28 sm:top-24 md:left-36 md:top-28 sm:rotate-[2deg] z-30",
          "sm:absolute sm:left-16 sm:top-40 md:left-24 md:top-56 sm:rotate-[-1deg] z-20",
          "sm:absolute sm:left-32 sm:top-64 md:left-40 md:top-80 sm:rotate-[4deg] z-10",
        ]
        const mobileRot = ["rotate-[-2deg]", "rotate-[1deg]", "rotate-[-1deg]", "rotate-[2deg]"][i]
        return (
          <div
            key={b.label}
            className={`${b.color} ${mobileRot} text-white rounded-2xl px-5 sm:px-8 py-4 sm:py-6 text-2xl sm:text-4xl font-bold shadow-md w-[180px] sm:w-[230px] text-center ${positions[i]}`}
          >
            {b.label}
          </div>
        )
      })}
    </div>
  )
}