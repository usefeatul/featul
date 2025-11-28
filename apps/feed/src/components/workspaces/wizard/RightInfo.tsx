"use client"

export default function RightInfo() {
  const blocks = [
    { label: "Gather", color: "bg-red-400" },
    { label: "Connect", color: "bg-purple-500" },
    { label: "Build", color: "bg-emerald-500" },
    { label: "Launch", color: "bg-blue-500" },
  ]
  return (
    <div className="w-full">
      <div className="sm:hidden grid grid-cols-2 gap-4 px-2">
        {blocks.map((b, i) => {
          const mobileOffsets = ["mt-0", "mt-4", "mt-2", "mt-6"]
          const mobileRot = ["rotate-[-2deg]", "rotate-[1deg]", "rotate-[-1deg]", "rotate-[2deg]"][i]
          return (
            <div
              key={b.label}
              className={`${b.color} ${mobileOffsets[i]} ${mobileRot} text-white rounded-sm px-4 py-5 text-2xl font-bold shadow-md w-full text-center`}
            >
              {b.label}
            </div>
          )
        })}
      </div>
      <div className="hidden sm:block relative w-full h-[400px] md:h-[460px]">
        {blocks.map((b, i) => {
          const positions = [
            "left-1/2 -translate-x-1/2 top-2 sm:left-10 sm:translate-x-0 sm:top-6 md:left-16 md:top-8 rotate-[-3deg] z-40",
            "left-1/2 -translate-x-1/2 top-20 translate-x-8 sm:left-28 sm:translate-x-0 sm:top-24 md:left-36 md:top-28 rotate-[2deg] z-30",
            "left-1/2 -translate-x-1/2 top-40 -translate-x-8 sm:left-16 sm:translate-x-0 sm:top-40 md:left-24 md:top-56 rotate-[-1deg] z-20",
            "left-1/2 -translate-x-1/2 top-60 -translate-x-6 sm:left-32 sm:translate-x-0 sm:top-64 md:left-40 md:top-80 rotate-[4deg] z-10",
          ]
          return (
            <div
              key={b.label}
              className={`${b.color} absolute ${positions[i]} text-white rounded-sm px-6 sm:px-8 py-5 sm:py-6 text-4xl sm:text-5xl font-bold shadow-md w-[230px] sm:w-[230px] text-center`}
            >
              {b.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}